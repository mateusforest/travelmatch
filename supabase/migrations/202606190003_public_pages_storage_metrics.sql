insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'travelmatch-images',
  'travelmatch-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.agency_profiles
add column if not exists slug text;

update public.agency_profiles
set slug = lower(
  trim(
    both '-' from regexp_replace(
      regexp_replace(coalesce(agency_name, id::text), '[^[:alnum:]]+', '-', 'g'),
      '-+',
      '-',
      'g'
    )
  )
) || '-' || left(id::text, 8)
where slug is null or trim(slug) = '';

create unique index if not exists agency_profiles_slug_key
on public.agency_profiles(slug)
where slug is not null;

create table if not exists public.package_views (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.agency_profile_views (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists package_views_package_id_idx on public.package_views(package_id);
create index if not exists package_views_agency_id_idx on public.package_views(agency_id);
create index if not exists package_views_created_at_idx on public.package_views(created_at);
create index if not exists agency_profile_views_agency_id_idx on public.agency_profile_views(agency_id);
create index if not exists agency_profile_views_created_at_idx on public.agency_profile_views(created_at);

alter table public.package_views enable row level security;
alter table public.agency_profile_views enable row level security;

drop policy if exists "Public can create package views" on public.package_views;
create policy "Public can create package views"
on public.package_views for insert
with check (
  exists (
    select 1
    from public.packages p
    where p.id = package_views.package_id
      and p.agency_id = package_views.agency_id
      and p.status = 'published'
  )
);

drop policy if exists "Agencies can read own package views" on public.package_views;
create policy "Agencies can read own package views"
on public.package_views for select
to authenticated
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = package_views.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Public can create agency profile views" on public.agency_profile_views;
create policy "Public can create agency profile views"
on public.agency_profile_views for insert
with check (
  exists (
    select 1
    from public.agency_profiles ap
    where ap.id = agency_profile_views.agency_id
      and ap.status = 'active'
  )
);

drop policy if exists "Agencies can read own agency profile views" on public.agency_profile_views;
create policy "Agencies can read own agency profile views"
on public.agency_profile_views for select
to authenticated
using (
  public.is_master()
  or exists (
    select 1
    from public.agency_profiles ap
    where ap.id = agency_profile_views.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Public can read travelmatch images" on storage.objects;
create policy "Public can read travelmatch images"
on storage.objects for select
using (bucket_id = 'travelmatch-images');

drop policy if exists "Agencies can upload own travelmatch images" on storage.objects;
create policy "Agencies can upload own travelmatch images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'travelmatch-images'
  and (storage.foldername(name))[1] in ('agency-logos', 'package-images')
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "Agencies can update own travelmatch images" on storage.objects;
create policy "Agencies can update own travelmatch images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'travelmatch-images'
  and (storage.foldername(name))[1] in ('agency-logos', 'package-images')
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'travelmatch-images'
  and (storage.foldername(name))[1] in ('agency-logos', 'package-images')
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "Agencies can delete own travelmatch images" on storage.objects;
create policy "Agencies can delete own travelmatch images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'travelmatch-images'
  and (storage.foldername(name))[1] in ('agency-logos', 'package-images')
  and (storage.foldername(name))[2] = auth.uid()::text
);
