insert into public.travel_categories (name, slug, image_url, active)
values
  ('Praia', 'praia', '/hero-plane-window.png', true),
  ('Europa', 'europa', '/hero-plane-window.png', true),
  ('Estados Unidos', 'estados-unidos', '/hero-plane-window.png', true),
  ('América do Sul', 'america-do-sul', '/hero-plane-window.png', true),
  ('Caribe', 'caribe', '/hero-plane-window.png', true),
  ('Cruzeiros', 'cruzeiros', '/hero-plane-window.png', true),
  ('Disney', 'disney', '/hero-plane-window.png', true),
  ('Lua de Mel', 'lua-de-mel', '/hero-plane-window.png', true),
  ('Família', 'familia', '/hero-plane-window.png', true),
  ('Aventura', 'aventura', '/hero-plane-window.png', true),
  ('Luxo', 'luxo', '/hero-plane-window.png', true),
  ('Neve', 'neve', '/hero-plane-window.png', true),
  ('Exóticos', 'exoticos', '/hero-plane-window.png', true),
  ('Intercâmbio', 'intercambio', '/hero-plane-window.png', true),
  ('Religioso', 'religioso', '/hero-plane-window.png', true),
  ('Grupos', 'grupos', '/hero-plane-window.png', true),
  ('Corporativo', 'corporativo', '/hero-plane-window.png', true)
on conflict (slug) do update
set
  name = excluded.name,
  image_url = coalesce(public.travel_categories.image_url, excluded.image_url),
  active = true;

update public.agency_profiles ap
set status = 'active'
where ap.status = 'pending'
  and exists (
    select 1
    from public.packages p
    where p.agency_id = ap.id
      and p.status = 'published'
  );

alter table public.agency_profiles
alter column status set default 'active';

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
      'active',
      'essential'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

create table if not exists public.package_gallery_images (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  image_url text not null,
  storage_path text,
  position integer not null default 0,
  created_at timestamp with time zone not null default now()
);

create index if not exists package_gallery_images_package_id_idx
on public.package_gallery_images(package_id, position);

alter table public.package_gallery_images enable row level security;

drop policy if exists "Public can read published package gallery" on public.package_gallery_images;
create policy "Public can read published package gallery"
on public.package_gallery_images for select
using (
  exists (
    select 1
    from public.packages p
    join public.agency_profiles ap on ap.id = p.agency_id
    where p.id = package_gallery_images.package_id
      and p.status = 'published'
      and ap.status = 'active'
  )
);

drop policy if exists "Agencies can manage own package gallery" on public.package_gallery_images;
create policy "Agencies can manage own package gallery"
on public.package_gallery_images for all
to authenticated
using (
  exists (
    select 1
    from public.agency_profiles ap
    where ap.id = package_gallery_images.agency_id
      and ap.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.agency_profiles ap
    where ap.id = package_gallery_images.agency_id
      and ap.user_id = auth.uid()
  )
);
