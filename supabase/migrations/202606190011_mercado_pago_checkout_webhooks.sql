alter table public.agency_subscriptions
add column if not exists gateway_subscription_id text;

alter table public.payment_intents
add column if not exists external_reference text,
add column if not exists provider_preference_id text,
add column if not exists provider_payment_id text,
add column if not exists gateway_subscription_id text,
add column if not exists paid_at timestamp with time zone,
add column if not exists failure_reason text;

create unique index if not exists payment_intents_external_reference_idx
on public.payment_intents(external_reference)
where external_reference is not null;

create index if not exists payment_intents_provider_payment_id_idx
on public.payment_intents(provider_payment_id)
where provider_payment_id is not null;

drop policy if exists "Agencies can create own pending payment intents" on public.payment_intents;
create policy "Agencies can create own pending payment intents"
on public.payment_intents for insert
with check (
  status = 'pending'
  and exists (
    select 1
    from public.agency_profiles ap
    where ap.id = payment_intents.agency_id
      and ap.user_id = auth.uid()
  )
);

drop policy if exists "Agencies can update own pending checkout metadata" on public.payment_intents;
