create table public.favorites (
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid not null,
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);

alter table public.favorites enable row level security;

create policy "Users can CRUD own favorites"
  on public.favorites for all
  using (auth.uid() = user_id);
