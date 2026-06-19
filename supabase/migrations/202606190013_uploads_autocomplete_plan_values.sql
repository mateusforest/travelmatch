alter table public.agency_profiles
add column if not exists banner_url text;

update public.subscription_plans
set price = 79.90
where slug = 'pro';

update public.subscription_plans
set price = 149.90
where slug = 'premium';

drop policy if exists "Agencies can upload own travelmatch images" on storage.objects;
create policy "Agencies can upload own travelmatch images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'travelmatch-images'
  and (storage.foldername(name))[1] in ('agency-logos', 'agency-banners', 'package-images')
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "Agencies can update own travelmatch images" on storage.objects;
create policy "Agencies can update own travelmatch images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'travelmatch-images'
  and (storage.foldername(name))[1] in ('agency-logos', 'agency-banners', 'package-images')
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'travelmatch-images'
  and (storage.foldername(name))[1] in ('agency-logos', 'agency-banners', 'package-images')
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "Agencies can delete own travelmatch images" on storage.objects;
create policy "Agencies can delete own travelmatch images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'travelmatch-images'
  and (storage.foldername(name))[1] in ('agency-logos', 'agency-banners', 'package-images')
  and (storage.foldername(name))[2] = auth.uid()::text
);
