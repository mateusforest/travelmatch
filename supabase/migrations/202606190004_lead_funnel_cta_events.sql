alter table public.traveler_leads
  add column if not exists source text,
  add column if not exists source_page text,
  add column if not exists cta_label text,
  add column if not exists travel_date text,
  add column if not exists travelers_count integer,
  add column if not exists budget_range text,
  add column if not exists lead_score integer not null default 0,
  add column if not exists priority text not null default 'normal',
  add column if not exists notes text,
  add column if not exists last_contact_at timestamp with time zone;

alter table public.traveler_leads
  drop constraint if exists traveler_leads_status_check;

alter table public.traveler_leads
  add constraint traveler_leads_status_check
  check (status in ('new', 'contacted', 'proposal_sent', 'won', 'converted', 'lost', 'archived'));

alter table public.traveler_leads
  drop constraint if exists traveler_leads_priority_check;

alter table public.traveler_leads
  add constraint traveler_leads_priority_check
  check (priority in ('low', 'normal', 'high'));

create index if not exists traveler_leads_status_idx on public.traveler_leads(status);
create index if not exists traveler_leads_source_idx on public.traveler_leads(source);

create table if not exists public.cta_events (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references public.packages(id) on delete set null,
  agency_id uuid references public.agency_profiles(id) on delete set null,
  event_type text not null,
  cta_label text,
  source_page text,
  created_at timestamp with time zone not null default now()
);

create index if not exists cta_events_agency_id_idx on public.cta_events(agency_id);
create index if not exists cta_events_package_id_idx on public.cta_events(package_id);
create index if not exists cta_events_event_type_idx on public.cta_events(event_type);

alter table public.cta_events enable row level security;

drop policy if exists "Public can create cta events" on public.cta_events;
create policy "Public can create cta events"
on public.cta_events for insert
with check (
  nullif(trim(event_type), '') is not null
  and (
    package_id is null
    or exists (
      select 1
      from public.packages p
      join public.agency_profiles ap on ap.id = p.agency_id
      where p.id = cta_events.package_id
        and p.status = 'published'
        and ap.status = 'active'
    )
  )
  and (
    agency_id is null
    or exists (
      select 1
      from public.agency_profiles ap
      where ap.id = cta_events.agency_id
        and ap.status = 'active'
    )
  )
);

drop policy if exists "Agencies can read own cta events" on public.cta_events;
create policy "Agencies can read own cta events"
on public.cta_events for select
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = cta_events.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Masters can manage cta events" on public.cta_events;
create policy "Masters can manage cta events"
on public.cta_events for all
using (public.is_master())
with check (public.is_master());

drop policy if exists "Public can create traveler leads" on public.traveler_leads;
create policy "Public can create traveler leads"
on public.traveler_leads for insert
with check (
  status = 'new'
  and (
    package_id is not null
    or agency_id is not null
    or nullif(trim(coalesce(traveler_email, '')), '') is not null
    or nullif(trim(coalesce(traveler_phone, '')), '') is not null
    or nullif(trim(coalesce(desired_destination, '')), '') is not null
    or nullif(trim(coalesce(message, '')), '') is not null
  )
  and (
    package_id is null
    or exists (
      select 1
      from public.packages p
      join public.agency_profiles ap on ap.id = p.agency_id
      where p.id = traveler_leads.package_id
        and p.status = 'published'
        and ap.status = 'active'
    )
  )
  and (
    agency_id is null
    or exists (
      select 1
      from public.agency_profiles ap
      where ap.id = traveler_leads.agency_id
        and ap.status = 'active'
    )
  )
);
