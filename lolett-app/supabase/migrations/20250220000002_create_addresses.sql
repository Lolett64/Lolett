create table public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null default 'Domicile',
  first_name text not null,
  last_name text not null,
  address text not null,
  city text not null,
  postal_code text not null,
  country text not null default 'France',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.addresses enable row level security;

create policy "Users can CRUD own addresses"
  on public.addresses for all
  using (auth.uid() = user_id);

create trigger addresses_updated_at
  before update on public.addresses
  for each row execute function public.handle_updated_at();
