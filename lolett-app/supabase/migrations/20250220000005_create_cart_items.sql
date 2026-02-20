create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid not null,
  size text not null,
  color text,
  quantity integer not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, product_id, size, color)
);

alter table public.cart_items enable row level security;

create policy "Users can CRUD own cart"
  on public.cart_items for all
  using (auth.uid() = user_id);

create trigger cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.handle_updated_at();
