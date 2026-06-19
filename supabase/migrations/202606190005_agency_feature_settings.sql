create table if not exists public.agency_feature_settings (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  mode text not null default 'auto',
  pinned boolean not null default false,
  hidden boolean not null default false,
  manual_order integer,
  editorial_label text,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint agency_feature_settings_agency_id_unique unique (agency_id),
  constraint agency_feature_settings_mode_check check (mode in ('auto', 'manual'))
);

create index if not exists agency_feature_settings_agency_id_idx
on public.agency_feature_settings(agency_id);

create index if not exists agency_feature_settings_visible_idx
on public.agency_feature_settings(hidden, pinned, manual_order);

drop trigger if exists agency_feature_settings_set_updated_at on public.agency_feature_settings;
create trigger agency_feature_settings_set_updated_at
before update on public.agency_feature_settings
for each row execute function public.set_updated_at();

alter table public.agency_feature_settings enable row level security;

drop policy if exists "Public can read visible agency feature settings" on public.agency_feature_settings;
create policy "Public can read visible agency feature settings"
on public.agency_feature_settings for select
using (
  exists (
    select 1
    from public.agency_profiles ap
    where ap.id = agency_feature_settings.agency_id
      and ap.status = 'active'
  )
);

drop policy if exists "Masters can manage agency feature settings" on public.agency_feature_settings;
create policy "Masters can manage agency feature settings"
on public.agency_feature_settings for all
using (public.is_master())
with check (public.is_master());

create or replace function public.get_featured_agencies(limit_count integer default 6)
returns table (
  id uuid,
  slug text,
  name text,
  rating text,
  editorial_label text,
  score integer,
  pinned boolean,
  manual_order integer
)
language sql
security definer
set search_path = public
as $$
  with published_packages as (
    select agency_id, count(*)::integer as published_packages
    from public.packages
    where status = 'published'
    group by agency_id
  ),
  package_view_counts as (
    select agency_id, count(*)::integer as package_views
    from public.package_views
    group by agency_id
  ),
  profile_view_counts as (
    select agency_id, count(*)::integer as profile_views
    from public.agency_profile_views
    group by agency_id
  ),
  lead_counts as (
    select
      agency_id,
      count(*)::integer as leads,
      count(*) filter (where status in ('won', 'converted'))::integer as won_leads
    from public.traveler_leads
    group by agency_id
  ),
  agency_cta_counts as (
    select agency_id, count(*)::integer as cta_events
    from public.cta_events
    group by agency_id
  ),
  scored as (
    select
      ap.id,
      ap.slug,
      ap.agency_name as name,
      coalesce(afs.editorial_label, null) as editorial_label,
      coalesce(afs.pinned, false) as pinned,
      afs.manual_order,
      greatest(
        0,
        least(
          100,
          round(
            10
            + least(coalesce(pvc.profile_views, 0), 25)
            + least(coalesce(pvc2.package_views, 0), 20)
            + least(coalesce(lc.leads, 0) * 4, 25)
            + least(
                case
                  when coalesce(lc.leads, 0) > 0
                    then round((coalesce(lc.won_leads, 0)::numeric / lc.leads::numeric) * 15)
                  else 0
                end,
                15
              )
            + least(coalesce(acc.cta_events, 0), 10)
            + least(coalesce(pp.published_packages, 0) * 2, 10)
            + case when coalesce(pp.published_packages, 0) = 0 then -20 else 0 end
          )
        )
      )::integer as score
    from public.agency_profiles ap
    left join public.agency_feature_settings afs on afs.agency_id = ap.id
    left join published_packages pp on pp.agency_id = ap.id
    left join profile_view_counts pvc on pvc.agency_id = ap.id
    left join package_view_counts pvc2 on pvc2.agency_id = ap.id
    left join lead_counts lc on lc.agency_id = ap.id
    left join agency_cta_counts acc on acc.agency_id = ap.id
    where ap.status = 'active'
      and coalesce(afs.hidden, false) = false
      and (afs.starts_at is null or afs.starts_at <= now())
      and (afs.ends_at is null or afs.ends_at >= now())
      and nullif(trim(coalesce(ap.city, '')), '') is not null
      and nullif(trim(coalesce(ap.state, '')), '') is not null
      and nullif(trim(coalesce(ap.description, '')), '') is not null
  )
  select
    scored.id,
    scored.slug,
    scored.name,
    scored.score::text || '%' as rating,
    scored.editorial_label,
    scored.score,
    scored.pinned,
    scored.manual_order
  from scored
  where scored.pinned = true or scored.score > 0
  order by scored.pinned desc, scored.manual_order nulls last, scored.score desc, scored.name asc
  limit greatest(limit_count, 0);
$$;

grant execute on function public.get_featured_agencies(integer) to anon, authenticated;
