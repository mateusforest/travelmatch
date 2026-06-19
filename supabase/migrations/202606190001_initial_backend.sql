create extension if not exists pgcrypto;

create table if not exists public.agency_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  agency_name text not null,
  responsible_name text not null,
  email text not null,
  phone text,
  city text,
  state text,
  description text,
  logo_url text,
  website text,
  instagram text,
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended', 'archived')),
  plan text not null default 'essential' check (plan in ('essential', 'performance', 'master')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.master_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'owner', 'support')),
  created_at timestamptz not null default now()
);

create table if not exists public.travel_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  destination text not null,
  category_id uuid references public.travel_categories(id) on delete set null,
  description text not null,
  price_from numeric,
  duration_days integer,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, slug)
);

create table if not exists public.traveler_leads (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references public.packages(id) on delete set null,
  agency_id uuid references public.agency_profiles(id) on delete set null,
  traveler_name text,
  traveler_email text,
  traveler_phone text,
  desired_destination text,
  category_slug text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'proposal_sent', 'converted', 'lost')),
  created_at timestamptz not null default now()
);

create table if not exists public.match_searches (
  id uuid primary key default gen_random_uuid(),
  search_term text not null,
  category_slug text,
  traveler_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists agency_profiles_user_id_idx on public.agency_profiles(user_id);
create index if not exists agency_profiles_status_idx on public.agency_profiles(status);
create index if not exists packages_agency_id_idx on public.packages(agency_id);
create index if not exists packages_status_idx on public.packages(status);
create index if not exists packages_category_id_idx on public.packages(category_id);
create index if not exists traveler_leads_agency_id_idx on public.traveler_leads(agency_id);
create index if not exists traveler_leads_package_id_idx on public.traveler_leads(package_id);
create index if not exists match_searches_category_slug_idx on public.match_searches(category_slug);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agency_profiles_set_updated_at on public.agency_profiles;
create trigger agency_profiles_set_updated_at
before update on public.agency_profiles
for each row execute function public.set_updated_at();

drop trigger if exists packages_set_updated_at on public.packages;
create trigger packages_set_updated_at
before update on public.packages
for each row execute function public.set_updated_at();

drop trigger if exists platform_settings_set_updated_at on public.platform_settings;
create trigger platform_settings_set_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

create or replace function public.is_master()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.master_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_agency_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data->>'account_type', '') = 'agency' then
    insert into public.agency_profiles (
      user_id,
      agency_name,
      responsible_name,
      email,
      phone,
      city,
      state,
      status,
      plan
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'agency_name', ''),
      coalesce(new.raw_user_meta_data->>'responsible_name', ''),
      coalesce(new.email, new.raw_user_meta_data->>'email', ''),
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'city',
      new.raw_user_meta_data->>'state',
      'pending',
      'essential'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_agency_profile on auth.users;
create trigger on_auth_user_created_create_agency_profile
after insert on auth.users
for each row execute function public.handle_new_agency_user();

alter table public.agency_profiles enable row level security;
alter table public.master_users enable row level security;
alter table public.travel_categories enable row level security;
alter table public.packages enable row level security;
alter table public.traveler_leads enable row level security;
alter table public.match_searches enable row level security;
alter table public.platform_settings enable row level security;

drop policy if exists "Public can read active agencies" on public.agency_profiles;
create policy "Public can read active agencies"
on public.agency_profiles for select
using (status = 'active');

drop policy if exists "Agencies can read own profile" on public.agency_profiles;
create policy "Agencies can read own profile"
on public.agency_profiles for select
to authenticated
using (user_id = auth.uid() or public.is_master());

drop policy if exists "Agencies can insert own profile" on public.agency_profiles;
create policy "Agencies can insert own profile"
on public.agency_profiles for insert
to authenticated
with check (user_id = auth.uid() or public.is_master());

drop policy if exists "Agencies can update own profile" on public.agency_profiles;
create policy "Agencies can update own profile"
on public.agency_profiles for update
to authenticated
using (user_id = auth.uid() or public.is_master())
with check (user_id = auth.uid() or public.is_master());

drop policy if exists "Masters can delete agency profiles" on public.agency_profiles;
create policy "Masters can delete agency profiles"
on public.agency_profiles for delete
to authenticated
using (public.is_master());

drop policy if exists "Users can read own master role" on public.master_users;
create policy "Users can read own master role"
on public.master_users for select
to authenticated
using (user_id = auth.uid() or public.is_master());

drop policy if exists "Masters can manage master users" on public.master_users;
create policy "Masters can manage master users"
on public.master_users for all
to authenticated
using (public.is_master())
with check (public.is_master());

drop policy if exists "Public can read active categories" on public.travel_categories;
create policy "Public can read active categories"
on public.travel_categories for select
using (active = true or public.is_master());

drop policy if exists "Masters can manage categories" on public.travel_categories;
create policy "Masters can manage categories"
on public.travel_categories for all
to authenticated
using (public.is_master())
with check (public.is_master());

drop policy if exists "Public can read published packages" on public.packages;
create policy "Public can read published packages"
on public.packages for select
using (status = 'published' or public.is_master());

drop policy if exists "Agencies can read own packages" on public.packages;
create policy "Agencies can read own packages"
on public.packages for select
to authenticated
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = packages.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Agencies can create own packages" on public.packages;
create policy "Agencies can create own packages"
on public.packages for insert
to authenticated
with check (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = packages.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Agencies can update own packages" on public.packages;
create policy "Agencies can update own packages"
on public.packages for update
to authenticated
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = packages.agency_id
      and ap.user_id = auth.uid()
  )
)
with check (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = packages.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Agencies can delete own packages" on public.packages;
create policy "Agencies can delete own packages"
on public.packages for delete
to authenticated
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = packages.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Public can create traveler leads" on public.traveler_leads;
create policy "Public can create traveler leads"
on public.traveler_leads for insert
with check (true);

drop policy if exists "Agencies can read own leads" on public.traveler_leads;
create policy "Agencies can read own leads"
on public.traveler_leads for select
to authenticated
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = traveler_leads.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Agencies can update own leads" on public.traveler_leads;
create policy "Agencies can update own leads"
on public.traveler_leads for update
to authenticated
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = traveler_leads.agency_id
      and ap.user_id = auth.uid()
  )
)
with check (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = traveler_leads.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Masters can delete leads" on public.traveler_leads;
create policy "Masters can delete leads"
on public.traveler_leads for delete
to authenticated
using (public.is_master());

drop policy if exists "Public can create match searches" on public.match_searches;
create policy "Public can create match searches"
on public.match_searches for insert
with check (true);

drop policy if exists "Masters can read match searches" on public.match_searches;
create policy "Masters can read match searches"
on public.match_searches for select
to authenticated
using (public.is_master());

drop policy if exists "Masters can manage platform settings" on public.platform_settings;
create policy "Masters can manage platform settings"
on public.platform_settings for all
to authenticated
using (public.is_master())
with check (public.is_master());
