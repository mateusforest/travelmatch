alter table public.agency_reviews
  add column if not exists hidden boolean not null default false,
  add column if not exists moderated_at timestamp with time zone,
  add column if not exists moderated_by uuid references public.master_users(id) on delete set null;

alter table public.cta_events
  add column if not exists lead_id uuid references public.traveler_leads(id) on delete set null;

create index if not exists cta_events_lead_id_idx
on public.cta_events(lead_id);

create table if not exists public.review_tokens (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.traveler_leads(id) on delete cascade,
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  token text not null unique,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  constraint review_tokens_lead_id_unique unique (lead_id)
);

create index if not exists review_tokens_token_idx on public.review_tokens(token);
create index if not exists review_tokens_agency_id_idx on public.review_tokens(agency_id);

alter table public.review_tokens enable row level security;

drop policy if exists "Public can read valid review tokens" on public.review_tokens;
create policy "Public can read valid review tokens"
on public.review_tokens for select
using (used_at is null and expires_at > now());

drop policy if exists "Public can mark valid review tokens used" on public.review_tokens;
create policy "Public can mark valid review tokens used"
on public.review_tokens for update
using (used_at is null and expires_at > now())
with check (used_at is not null);

drop policy if exists "Agencies can read own review tokens" on public.review_tokens;
create policy "Agencies can read own review tokens"
on public.review_tokens for select
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = review_tokens.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Masters can manage review tokens" on public.review_tokens;
create policy "Masters can manage review tokens"
on public.review_tokens for all
using (public.is_master())
with check (public.is_master());

drop policy if exists "Public can create won lead reviews" on public.agency_reviews;
create policy "Public can create won lead reviews"
on public.agency_reviews for insert
with check (
  exists (
    select 1
    from public.traveler_leads tl
    join public.review_tokens rt on rt.lead_id = tl.id and rt.agency_id = tl.agency_id
    where tl.id = agency_reviews.lead_id
      and tl.agency_id = agency_reviews.agency_id
      and tl.status in ('won', 'converted')
      and rt.used_at is null
      and rt.expires_at > now()
  )
  and not exists (
    select 1
    from public.agency_profiles ap
    where ap.id = agency_reviews.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Agencies can read own reviews" on public.agency_reviews;
create policy "Agencies can read own reviews"
on public.agency_reviews for select
using (
  public.is_master()
  or (
    hidden = false
    and exists (
      select 1
      from public.agency_profiles ap
      where ap.id = agency_reviews.agency_id
        and ap.user_id = auth.uid()
    )
  )
);

create or replace function public.generate_review_token_for_won_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_token text;
begin
  if new.agency_id is null then
    return new;
  end if;

  if new.status in ('won', 'converted')
    and (tg_op = 'INSERT' or old.status is distinct from new.status)
  then
    generated_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

    insert into public.review_tokens (
      lead_id,
      agency_id,
      token,
      expires_at
    )
    values (
      new.id,
      new.agency_id,
      generated_token,
      now() + interval '30 days'
    )
    on conflict (lead_id) do nothing;

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
      'review_token_created',
      'Link de avaliacao gerado',
      'Token publico de avaliacao criado para o lead ganho.',
      jsonb_build_object('expires_at', now() + interval '30 days'),
      auth.uid()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists traveler_leads_generate_review_token on public.traveler_leads;
create trigger traveler_leads_generate_review_token
after insert or update of status on public.traveler_leads
for each row execute function public.generate_review_token_for_won_lead();

create or replace function public.create_timeline_for_review_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lead_timeline_events (
    lead_id,
    agency_id,
    event_type,
    title,
    description,
    metadata
  )
  values (
    new.lead_id,
    new.agency_id,
    'review_submitted',
    'Avaliacao enviada',
    new.comment,
    jsonb_build_object('rating', new.rating, 'would_recommend', new.would_recommend)
  );

  return new;
end;
$$;

drop trigger if exists agency_reviews_create_timeline on public.agency_reviews;
create trigger agency_reviews_create_timeline
after insert on public.agency_reviews
for each row execute function public.create_timeline_for_review_insert();
