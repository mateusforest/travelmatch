create table if not exists public.master_audit_logs (
  id uuid primary key default gen_random_uuid(),
  master_user_id uuid references public.master_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists master_audit_logs_master_user_id_idx
on public.master_audit_logs(master_user_id);

create index if not exists master_audit_logs_entity_idx
on public.master_audit_logs(entity_type, entity_id);

create index if not exists master_audit_logs_created_at_idx
on public.master_audit_logs(created_at desc);

alter table public.master_audit_logs enable row level security;

drop policy if exists "Masters can read audit logs" on public.master_audit_logs;
create policy "Masters can read audit logs"
on public.master_audit_logs for select
using (public.is_master());

drop policy if exists "Masters can create audit logs" on public.master_audit_logs;
create policy "Masters can create audit logs"
on public.master_audit_logs for insert
with check (public.is_master());

create or replace function public.get_agency_feature_score_breakdown(target_agency_id uuid)
returns table (
  profile_views_score integer,
  package_views_score integer,
  leads_score integer,
  conversion_score integer,
  cta_events_score integer,
  published_packages_score integer,
  completeness_score integer,
  total_score integer
)
language sql
security definer
set search_path = public
as $$
  with base as (
    select
      ap.id,
      ap.status,
      case
        when nullif(trim(coalesce(ap.city, '')), '') is not null
          and nullif(trim(coalesce(ap.state, '')), '') is not null
          and nullif(trim(coalesce(ap.description, '')), '') is not null
        then 10
        else 0
      end as completeness_score
    from public.agency_profiles ap
    where ap.id = target_agency_id
      and public.is_master()
  ),
  published_packages as (
    select agency_id, count(*)::integer as published_packages
    from public.packages
    where status = 'published'
      and agency_id = target_agency_id
    group by agency_id
  ),
  package_view_counts as (
    select agency_id, count(*)::integer as package_views
    from public.package_views
    where agency_id = target_agency_id
    group by agency_id
  ),
  profile_view_counts as (
    select agency_id, count(*)::integer as profile_views
    from public.agency_profile_views
    where agency_id = target_agency_id
    group by agency_id
  ),
  lead_counts as (
    select
      agency_id,
      count(*)::integer as leads,
      count(*) filter (where status in ('won', 'converted'))::integer as won_leads
    from public.traveler_leads
    where agency_id = target_agency_id
    group by agency_id
  ),
  cta_counts as (
    select agency_id, count(*)::integer as cta_events
    from public.cta_events
    where agency_id = target_agency_id
    group by agency_id
  ),
  scored as (
    select
      case when b.status = 'active' then least(coalesce(pvc.profile_views, 0), 25) else 0 end as profile_views_score,
      case when b.status = 'active' then least(coalesce(pvc2.package_views, 0), 20) else 0 end as package_views_score,
      case when b.status = 'active' then least(coalesce(lc.leads, 0) * 4, 25) else 0 end as leads_score,
      case
        when b.status = 'active' and coalesce(lc.leads, 0) > 0
          then least(round((coalesce(lc.won_leads, 0)::numeric / lc.leads::numeric) * 15)::integer, 15)
        else 0
      end as conversion_score,
      case when b.status = 'active' then least(coalesce(cc.cta_events, 0), 10) else 0 end as cta_events_score,
      case when b.status = 'active' then least(coalesce(pp.published_packages, 0) * 2, 10) else 0 end as published_packages_score,
      case when b.status = 'active' then b.completeness_score else 0 end as completeness_score,
      case when coalesce(pp.published_packages, 0) = 0 then -20 else 0 end as package_penalty
    from base b
    left join published_packages pp on pp.agency_id = b.id
    left join profile_view_counts pvc on pvc.agency_id = b.id
    left join package_view_counts pvc2 on pvc2.agency_id = b.id
    left join lead_counts lc on lc.agency_id = b.id
    left join cta_counts cc on cc.agency_id = b.id
  )
  select
    scored.profile_views_score,
    scored.package_views_score,
    scored.leads_score,
    scored.conversion_score,
    scored.cta_events_score,
    scored.published_packages_score,
    scored.completeness_score,
    greatest(
      0,
      least(
        100,
        scored.profile_views_score
        + scored.package_views_score
        + scored.leads_score
        + scored.conversion_score
        + scored.cta_events_score
        + scored.published_packages_score
        + scored.completeness_score
        + scored.package_penalty
      )
    )::integer as total_score
  from scored;
$$;

grant execute on function public.get_agency_feature_score_breakdown(uuid) to authenticated;
