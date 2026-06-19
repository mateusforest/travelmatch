-- Run this manually in the Supabase SQL editor after the first master user exists in auth.users.
-- Replace the placeholder UUID with the existing auth.users.id of the user that should become master.
-- This does not create a public bypass and does not disable RLS.

insert into public.master_users (user_id, role)
values ('00000000-0000-0000-0000-000000000000', 'owner')
on conflict (user_id) do update
set role = excluded.role;
