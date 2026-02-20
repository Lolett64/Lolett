create table public.loyalty_rewards (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  points_cost integer not null,
  reward_type text not null check (reward_type in ('discount', 'shipping', 'access')),
  value numeric,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Seed default rewards
insert into public.loyalty_rewards (name, description, points_cost, reward_type, value) values
  ('Bon de 5€', 'Réduction de 5€ sur votre prochaine commande', 100, 'discount', 5),
  ('Livraison offerte', 'Livraison gratuite sur votre prochaine commande', 250, 'shipping', 5.90),
  ('Bon de 15€', 'Réduction de 15€ sur votre prochaine commande', 500, 'discount', 15),
  ('Accès ventes privées', 'Accès exclusif aux ventes privées LOLETT', 1000, 'access', null);

alter table public.loyalty_rewards enable row level security;

create policy "Anyone can view active rewards"
  on public.loyalty_rewards for select
  using (is_active = true);
