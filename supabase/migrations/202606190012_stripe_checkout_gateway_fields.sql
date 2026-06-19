alter table public.payment_intents
add column if not exists gateway text,
add column if not exists gateway_checkout_id text,
add column if not exists gateway_payment_id text;

update public.payment_intents
set gateway = provider
where gateway is null
  and provider is not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payment_intents'
      and column_name = 'provider_preference_id'
  ) then
    update public.payment_intents
    set gateway_checkout_id = provider_preference_id
    where gateway_checkout_id is null
      and provider_preference_id is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payment_intents'
      and column_name = 'provider_payment_id'
  ) then
    update public.payment_intents
    set gateway_payment_id = provider_payment_id
    where gateway_payment_id is null
      and provider_payment_id is not null;
  end if;
end $$;

create index if not exists payment_intents_gateway_checkout_id_idx
on public.payment_intents(gateway_checkout_id)
where gateway_checkout_id is not null;

create index if not exists payment_intents_gateway_payment_id_idx
on public.payment_intents(gateway_payment_id)
where gateway_payment_id is not null;
