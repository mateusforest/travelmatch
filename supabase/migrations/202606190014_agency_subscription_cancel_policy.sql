drop policy if exists "Agencies can cancel own subscriptions" on public.agency_subscriptions;
create policy "Agencies can cancel own subscriptions"
on public.agency_subscriptions for update
using (
  status in ('trial', 'active')
  and exists (
    select 1
    from public.agency_profiles ap
    where ap.id = agency_subscriptions.agency_id
      and ap.user_id = auth.uid()
  )
)
with check (
  status = 'canceled'
  and exists (
    select 1
    from public.agency_profiles ap
    where ap.id = agency_subscriptions.agency_id
      and ap.user_id = auth.uid()
  )
);
