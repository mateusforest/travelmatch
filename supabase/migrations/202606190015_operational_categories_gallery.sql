insert into public.travel_categories (name, slug, active)
values
  ('Praia', 'praia', true),
  ('Europa', 'europa', true),
  ('Estados Unidos', 'estados-unidos', true),
  ('América do Sul', 'america-do-sul', true),
  ('Caribe', 'caribe', true),
  ('Cruzeiros', 'cruzeiros', true),
  ('Disney', 'disney', true),
  ('Lua de Mel', 'lua-de-mel', true),
  ('Família', 'familia', true),
  ('Aventura', 'aventura', true),
  ('Luxo', 'luxo', true),
  ('Neve', 'neve', true),
  ('Exóticos', 'exoticos', true),
  ('Intercâmbio', 'intercambio', true),
  ('Religioso', 'religioso', true),
  ('Grupos', 'grupos', true),
  ('Corporativo', 'corporativo', true)
on conflict (slug) do update
set
  name = excluded.name,
  active = true;

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
