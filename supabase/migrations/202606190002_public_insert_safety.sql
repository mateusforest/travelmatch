drop policy if exists "Public can create traveler leads" on public.traveler_leads;
create policy "Public can create traveler leads"
on public.traveler_leads for insert
with check (
  status = 'new'
  and (
    package_id is not null
    or agency_id is not null
    or nullif(trim(coalesce(traveler_email, '')), '') is not null
    or nullif(trim(coalesce(traveler_phone, '')), '') is not null
    or nullif(trim(coalesce(desired_destination, '')), '') is not null
    or nullif(trim(coalesce(message, '')), '') is not null
  )
  and (
    package_id is null
    or exists (
      select 1
      from public.packages p
      where p.id = traveler_leads.package_id
        and p.status = 'published'
    )
  )
);

drop policy if exists "Public can create match searches" on public.match_searches;
create policy "Public can create match searches"
on public.match_searches for insert
with check (nullif(trim(search_term), '') is not null);
