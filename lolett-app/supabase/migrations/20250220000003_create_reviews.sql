create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  flagged boolean default false,
  flag_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.reviews enable row level security;

create policy "Anyone can read non-flagged reviews"
  on public.reviews for select
  using (flagged = false or auth.uid() = user_id);

create policy "Authenticated users can insert reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();
