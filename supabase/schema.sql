-- Execute este SQL no Supabase (SQL Editor) para criar as tabelas da Fábrica de Conteúdo.

-- Produtos (configuração da marca e plataformas)
create table if not exists public.products (
  id text primary key,
  name text not null default '',
  product_context text default '',
  target_audience text default '',
  usp text default '',
  pain_points text default '',
  restrictions text default '',
  content_pillar text default '',
  platform_config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Histórico de pacotes de conteúdo gerados
create table if not exists public.content_history (
  id uuid primary key default gen_random_uuid(),
  idea text not null,
  product_id text not null,
  product_name text not null,
  content_package jsonb not null,
  created_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_content_history_created_at on public.content_history (created_at desc);
create index if not exists idx_content_history_product_id on public.content_history (product_id);

-- RLS (Row Level Security): descomente e ajuste se quiser proteger por usuário
-- alter table public.products enable row level security;
-- alter table public.content_history enable row level security;
-- create policy "Users can manage own products" on public.products for all using (auth.uid() is not null);
-- create policy "Users can manage own content" on public.content_history for all using (auth.uid() is not null);
