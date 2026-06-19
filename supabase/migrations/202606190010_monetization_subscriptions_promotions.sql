create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price numeric not null default 0,
  package_limit integer,
  analytics_level text not null default 'basic',
  priority_level integer not null default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

insert into public.subscription_plans (
  slug,
  name,
  price,
  package_limit,
  analytics_level,
  priority_level,
  active
)
values
  ('free', 'Free', 0, 3, 'basic', 0, true),
  ('pro', 'Pro', 79.90, 30, 'complete', 0, true),
  ('premium', 'Premium', 149.90, null, 'advanced', 5, true)
on conflict (slug) do update
set
  name = excluded.name,
  price = excluded.price,
  package_limit = excluded.package_limit,
  analytics_level = excluded.analytics_level,
  priority_level = excluded.priority_level,
  active = excluded.active;

create table if not exists public.agency_subscriptions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  status text not null default 'active',
  started_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  constraint agency_subscriptions_status_check check (status in ('trial', 'active', 'canceled', 'expired', 'suspended'))
);

create index if not exists agency_subscriptions_agency_id_idx
on public.agency_subscriptions(agency_id);

create index if not exists agency_subscriptions_status_idx
on public.agency_subscriptions(status);

create unique index if not exists agency_subscriptions_one_current_idx
on public.agency_subscriptions(agency_id)
where status in ('trial', 'active');

insert into public.agency_subscriptions (agency_id, plan_id, status)
select ap.id, sp.id, 'active'
from public.agency_profiles ap
cross join public.subscription_plans sp
where sp.slug = 'free'
  and not exists (
    select 1
    from public.agency_subscriptions s
    where s.agency_id = ap.id
      and s.status in ('trial', 'active')
  );

create table if not exists public.agency_promotions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  type text not null,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  status text not null default 'pending',
  amount numeric not null default 0,
  campaign_status text,
  campaign_notes text,
  campaign_report_url text,
  created_at timestamp with time zone not null default now(),
  constraint agency_promotions_type_check check (type in ('featured_7', 'featured_15', 'featured_30', 'boost')),
  constraint agency_promotions_status_check check (status in ('pending', 'active', 'completed', 'canceled')),
  constraint agency_promotions_campaign_status_check check (
    campaign_status is null
    or campaign_status in ('pending', 'scheduled', 'running', 'completed', 'canceled')
  )
);

create index if not exists agency_promotions_agency_id_idx
on public.agency_promotions(agency_id);

create index if not exists agency_promotions_active_idx
on public.agency_promotions(status, starts_at, ends_at);

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agency_profiles(id) on delete set null,
  provider text not null,
  product_type text not null,
  reference_id uuid,
  status text not null default 'pending',
  amount numeric not null default 0,
  currency text not null default 'BRL',
  checkout_url text,
  provider_payload jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

drop trigger if exists payment_intents_set_updated_at on public.payment_intents;
create trigger payment_intents_set_updated_at
before update on public.payment_intents
for each row execute function public.set_updated_at();

alter table public.subscription_plans enable row level security;
alter table public.agency_subscriptions enable row level security;
alter table public.agency_promotions enable row level security;
alter table public.payment_intents enable row level security;

drop policy if exists "Public can read active subscription plans" on public.subscription_plans;
create policy "Public can read active subscription plans"
on public.subscription_plans for select
using (active = true);

drop policy if exists "Masters can manage subscription plans" on public.subscription_plans;
create policy "Masters can manage subscription plans"
on public.subscription_plans for all
using (public.is_master())
with check (public.is_master());

drop policy if exists "Agencies can read own subscriptions" on public.agency_subscriptions;
create policy "Agencies can read own subscriptions"
on public.agency_subscriptions for select
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = agency_subscriptions.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Masters can manage subscriptions" on public.agency_subscriptions;
create policy "Masters can manage subscriptions"
on public.agency_subscriptions for all
using (public.is_master())
with check (public.is_master());

drop policy if exists "Agencies can read own promotions" on public.agency_promotions;
create policy "Agencies can read own promotions"
on public.agency_promotions for select
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = agency_promotions.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Masters can manage promotions" on public.agency_promotions;
create policy "Masters can manage promotions"
on public.agency_promotions for all
using (public.is_master())
with check (public.is_master());

drop policy if exists "Agencies can read own payment intents" on public.payment_intents;
create policy "Agencies can read own payment intents"
on public.payment_intents for select
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = payment_intents.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Masters can manage payment intents" on public.payment_intents;
create policy "Masters can manage payment intents"
on public.payment_intents for all
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
  active_promotions as (
    select agency_id, count(*)::integer as active_promotions
    from public.agency_promotions
    where status = 'active'
      and type in ('featured_7', 'featured_15', 'featured_30', 'boost')
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
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
      coalesce(apr.active_promotions, 0) as promotion_bonus,
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
    left join active_promotions apr on apr.agency_id = ap.id
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
  where scored.pinned = true or scored.score > 0 or scored.promotion_bonus > 0
  order by
    scored.pinned desc,
    scored.manual_order nulls last,
    (scored.promotion_bonus > 0) desc,
    scored.score desc,
    scored.name asc
  limit greatest(limit_count, 0);
$$;
