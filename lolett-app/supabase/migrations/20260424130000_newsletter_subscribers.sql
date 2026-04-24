-- Newsletter subscribers: store every opt-in so the list stays in our DB even if
-- Resend Audiences goes away. RLS is locked to service_role only — the API route
-- uses the admin client.

create extension if not exists citext;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  consent_at timestamptz not null default now(),
  source text not null default 'home',
  resend_contact_id text,
  unsubscribed_at timestamptz
);

create index if not exists idx_newsletter_subscribers_email
  on public.newsletter_subscribers (email);

alter table public.newsletter_subscribers enable row level security;

-- Only service_role may read/write (anon subscribes via API route using service key)
drop policy if exists "service only" on public.newsletter_subscribers;
create policy "service only"
  on public.newsletter_subscribers
  for all
  using (false);
