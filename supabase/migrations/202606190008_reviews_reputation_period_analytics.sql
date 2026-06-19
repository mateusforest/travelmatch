alter table public.match_settings
  add column if not exists reputation_weight integer not null default 10;

create table if not exists public.reputation_settings (
  id uuid primary key default gen_random_uuid(),
  reviews_weight integer not null default 40,
  recommendation_weight integer not null default 20,
  conversion_weight integer not null default 20,
  response_time_weight integer not null default 10,
  service_weight integer not null default 10,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

insert into public.reputation_settings (
  reviews_weight,
  recommendation_weight,
  conversion_weight,
  response_time_weight,
  service_weight
)
select 40, 20, 20, 10, 10
where not exists (select 1 from public.reputation_settings);

drop trigger if exists reputation_settings_set_updated_at on public.reputation_settings;
create trigger reputation_settings_set_updated_at
before update on public.reputation_settings
for each row execute function public.set_updated_at();

alter table public.reputation_settings enable row level security;

drop policy if exists "Public can read reputation settings" on public.reputation_settings;
create policy "Public can read reputation settings"
on public.reputation_settings for select
using (true);

drop policy if exists "Masters can manage reputation settings" on public.reputation_settings;
create policy "Masters can manage reputation settings"
on public.reputation_settings for all
using (public.is_master())
with check (public.is_master());

create table if not exists public.agency_reviews (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  lead_id uuid not null references public.traveler_leads(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  would_recommend boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint agency_reviews_lead_id_unique unique (lead_id)
);

create index if not exists agency_reviews_agency_id_idx
on public.agency_reviews(agency_id);

alter table public.agency_reviews enable row level security;

drop policy if exists "Public can create won lead reviews" on public.agency_reviews;
create policy "Public can create won lead reviews"
on public.agency_reviews for insert
with check (
  exists (
    select 1
    from public.traveler_leads tl
    where tl.id = agency_reviews.lead_id
      and tl.agency_id = agency_reviews.agency_id
      and tl.status in ('won', 'converted')
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
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = agency_reviews.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Masters can moderate reviews" on public.agency_reviews;
create policy "Masters can moderate reviews"
on public.agency_reviews for all
using (public.is_master())
with check (public.is_master());

create or replace function public.get_agency_reputation_summary(target_agency_id uuid)
returns table (
  agency_id uuid,
  average_rating numeric,
  review_count integer,
  recommendation_rate integer,
  reputation_score integer
)
language sql
security definer
set search_path = public
as $$
  with settings as (
    select *
    from public.reputation_settings
    order by created_at asc
    limit 1
  ),
  reviews as (
    select
      agency_id,
      avg(rating)::numeric as average_rating,
      count(*)::integer as review_count,
      case
        when count(*) > 0
          then round((count(*) filter (where would_recommend = true)::numeric / count(*)::numeric) * 100)::integer
        else 0
      end as recommendation_rate
    from public.agency_reviews
    where agency_id = target_agency_id
    group by agency_id
  ),
  leads as (
    select
      agency_id,
      count(*)::integer as total_leads,
      count(*) filter (where status in ('won', 'converted'))::integer as won_leads,
      count(*) filter (where status <> 'new')::integer as responded_leads
    from public.traveler_leads
    where agency_id = target_agency_id
    group by agency_id
  ),
  first_response as (
    select
      tl.agency_id,
      avg(extract(epoch from (first_event.created_at - tl.created_at)) / 3600)::numeric as avg_hours
    from public.traveler_leads tl
    left join lateral (
      select lte.created_at
      from public.lead_timeline_events lte
      where lte.lead_id = tl.id
        and lte.event_type in ('status_changed', 'contact_updated', 'manual')
      order by lte.created_at asc
      limit 1
    ) first_event on true
    where tl.agency_id = target_agency_id
    group by tl.agency_id
  )
  select
    target_agency_id as agency_id,
    coalesce(round(r.average_rating, 2), 0) as average_rating,
    coalesce(r.review_count, 0) as review_count,
    coalesce(r.recommendation_rate, 0) as recommendation_rate,
    least(
      100,
      greatest(
        0,
        round(
          ((coalesce(r.average_rating, 0) / 5) * s.reviews_weight)
          + ((coalesce(r.recommendation_rate, 0)::numeric / 100) * s.recommendation_weight)
          + (
            case when coalesce(l.total_leads, 0) > 0
              then (coalesce(l.won_leads, 0)::numeric / l.total_leads::numeric) * s.conversion_weight
              else 0
            end
          )
          + (
            case
              when fr.avg_hours is null then 0
              when fr.avg_hours <= 24 then s.response_time_weight
              when fr.avg_hours <= 72 then s.response_time_weight * 0.6
              else s.response_time_weight * 0.25
            end
          )
          + (
            case when coalesce(l.total_leads, 0) > 0
              then (coalesce(l.responded_leads, 0)::numeric / l.total_leads::numeric) * s.service_weight
              else 0
            end
          )
        )
      )
    )::integer as reputation_score
  from settings s
  left join reviews r on r.agency_id = target_agency_id
  left join leads l on l.agency_id = target_agency_id
  left join first_response fr on fr.agency_id = target_agency_id;
$$;

grant execute on function public.get_agency_reputation_summary(uuid) to anon, authenticated;
