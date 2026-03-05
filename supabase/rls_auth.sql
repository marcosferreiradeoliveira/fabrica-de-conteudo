-- Execute no SQL Editor do Supabase DEPOIS do schema.sql
-- Adiciona autenticação por usuário (cada um vê só seus dados).

-- 1) Coluna user_id nas tabelas
alter table public.products
  add column if not exists user_id uuid references auth.users(id);

alter table public.content_history
  add column if not exists user_id uuid references auth.users(id);

-- 2) Índice único por usuário em products (permite mesmo id para usuários diferentes)
create unique index if not exists idx_products_user_id_id
  on public.products (user_id, id)
  where user_id is not null;

create index if not exists idx_products_user_id on public.products (user_id);
create index if not exists idx_content_history_user_id on public.content_history (user_id);

-- 3) Ativar RLS
alter table public.products enable row level security;
alter table public.content_history enable row level security;

-- 4) Políticas: cada usuário só acessa suas linhas
drop policy if exists "Users manage own products" on public.products;
create policy "Users manage own products" on public.products
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own content_history" on public.content_history;
create policy "Users manage own content_history" on public.content_history
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
