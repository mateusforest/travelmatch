-- TravelMatch: cadastrar primeiro usuário master
-- 1. Crie/autentique o usuário normalmente pelo Supabase Auth ou pela tela /entrar.
-- 2. Copie o UUID do usuário em Authentication > Users.
-- 3. Substitua o UUID abaixo e execute no SQL Editor do Supabase.
-- Não use e-mail, senha fixa ou service role no frontend.

insert into public.master_users (user_id, role)
values ('00000000-0000-0000-0000-000000000000', 'owner')
on conflict (user_id) do update
set role = excluded.role;
