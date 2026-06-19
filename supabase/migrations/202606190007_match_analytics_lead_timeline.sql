create table if not exists public.match_settings (
  id uuid primary key default gen_random_uuid(),
  destination_weight integer not null default 45,
  category_weight integer not null default 20,
  budget_weight integer not null default 10,
  date_weight integer not null default 5,
  travelers_weight integer not null default 5,
  featured_bonus integer not null default 10,
  performance_bonus integer not null default 15,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

insert into public.match_settings (
  destination_weight,
  category_weight,
  budget_weight,
  date_weight,
  travelers_weight,
  featured_bonus,
  performance_bonus
)
select 45, 20, 10, 5, 5, 10, 15
where not exists (select 1 from public.match_settings);

drop trigger if exists match_settings_set_updated_at on public.match_settings;
create trigger match_settings_set_updated_at
before update on public.match_settings
for each row execute function public.set_updated_at();

alter table public.match_settings enable row level security;

drop policy if exists "Public can read match settings" on public.match_settings;
create policy "Public can read match settings"
on public.match_settings for select
using (true);

drop policy if exists "Masters can manage match settings" on public.match_settings;
create policy "Masters can manage match settings"
on public.match_settings for all
using (public.is_master())
with check (public.is_master());

create table if not exists public.lead_timeline_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.traveler_leads(id) on delete cascade,
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  metadata jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone not null default now()
);

create index if not exists lead_timeline_events_lead_id_idx
on public.lead_timeline_events(lead_id);

create index if not exists lead_timeline_events_agency_id_idx
on public.lead_timeline_events(agency_id);

alter table public.lead_timeline_events enable row level security;

drop policy if exists "Agencies can read own lead timeline" on public.lead_timeline_events;
create policy "Agencies can read own lead timeline"
on public.lead_timeline_events for select
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = lead_timeline_events.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Agencies can create own lead timeline" on public.lead_timeline_events;
create policy "Agencies can create own lead timeline"
on public.lead_timeline_events for insert
with check (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = lead_timeline_events.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Masters can manage lead timeline" on public.lead_timeline_events;
create policy "Masters can manage lead timeline"
on public.lead_timeline_events for all
using (public.is_master())
with check (public.is_master());

create or replace function public.create_lead_timeline_for_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.agency_id is not null then
    insert into public.lead_timeline_events (
      lead_id,
      agency_id,
      event_type,
      title,
      description,
      metadata
    )
    values (
      new.id,
      new.agency_id,
      'lead_created',
      'Lead criado',
      'Interesse recebido pelo TravelMatch.',
      jsonb_build_object('source', new.source, 'source_page', new.source_page, 'cta_label', new.cta_label)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists traveler_leads_create_timeline on public.traveler_leads;
create trigger traveler_leads_create_timeline
after insert on public.traveler_leads
for each row execute function public.create_lead_timeline_for_insert();

create or replace function public.create_lead_timeline_for_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.agency_id is null then
    return new;
  end if;

  if old.status is distinct from new.status then
    insert into public.lead_timeline_events (
      lead_id,
      agency_id,
      event_type,
      title,
      description,
      metadata,
      created_by
    )
    values (
      new.id,
      new.agency_id,
      'status_changed',
      case
        when new.status = 'proposal_sent' then 'Proposta enviada'
        when new.status = 'won' then 'Lead ganho'
        when new.status = 'lost' then 'Lead perdido'
        else 'Status alterado'
      end,
      'Status alterado de ' || old.status || ' para ' || new.status || '.',
      jsonb_build_object('old_status', old.status, 'new_status', new.status),
      auth.uid()
    );
  end if;

  if old.notes is distinct from new.notes then
    insert into public.lead_timeline_events (
      lead_id,
      agency_id,
      event_type,
      title,
      description,
      metadata,
      created_by
    )
    values (
      new.id,
      new.agency_id,
      'note_updated',
      'Anotacao atualizada',
      nullif(new.notes, ''),
      jsonb_build_object('has_notes', new.notes is not null),
      auth.uid()
    );
  end if;

  if old.last_contact_at is distinct from new.last_contact_at then
    insert into public.lead_timeline_events (
      lead_id,
      agency_id,
      event_type,
      title,
      description,
      metadata,
      created_by
    )
    values (
      new.id,
      new.agency_id,
      'contact_updated',
      'Ultimo contato atualizado',
      null,
      jsonb_build_object('last_contact_at', new.last_contact_at),
      auth.uid()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists traveler_leads_update_timeline on public.traveler_leads;
create trigger traveler_leads_update_timeline
after update on public.traveler_leads
for each row execute function public.create_lead_timeline_for_update();
