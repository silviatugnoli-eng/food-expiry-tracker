-- Esegui questo script nell'editor SQL di Supabase

-- Tabella prodotti
create table public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  expiry_date date not null,
  notes text,
  created_at timestamptz default now()
);

-- Tabella subscriptions push
create table public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subscription text not null,
  endpoint text not null unique,
  created_at timestamptz default now()
);

-- Row Level Security: ogni utente vede solo i propri dati
alter table public.products enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "Utenti vedono solo i propri prodotti"
  on public.products for all
  using (auth.uid() = user_id);

create policy "Utenti vedono solo le proprie subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id);
