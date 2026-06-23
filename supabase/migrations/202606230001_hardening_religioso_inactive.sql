insert into public.travel_categories (name, slug, active)
values ('Religioso', 'religioso', false)
on conflict (slug) do update
set active = false;
