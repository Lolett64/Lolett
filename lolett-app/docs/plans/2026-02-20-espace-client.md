# Espace Client Premium — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add full user accounts with auth, profile, orders history, favorites sync, cart persistence, loyalty points, reviews, and personalized recommendations.

**Architecture:** Supabase Auth (email + Google OAuth) with RLS policies. Server-side session via middleware. Client features (cart, favorites) migrate from localStorage to server when authenticated, with localStorage fallback for guests.

**Tech Stack:** Supabase Auth + RLS, Next.js App Router middleware, Zustand (hybrid local+server stores), Resend (transactional emails)

---

## Phase 1: Supabase Setup & Auth Infrastructure

### Task 1: Install Supabase CLI & init migrations

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/00001_create_profiles.sql`

**Step 1: Install Supabase CLI**

Run: `npm install -g supabase && cd /Users/trikilyes/Desktop/Lorett/lolett-app && supabase init`

**Step 2: Link to existing project**

Run: `supabase link --project-ref utgwrfqnaoggckfruzzo`

**Step 3: Create profiles migration**

Create `supabase/migrations/00001_create_profiles.sql`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  loyalty_points integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
```

**Step 4: Push migration**

Run: `supabase db push`

**Step 5: Commit**

```bash
git add supabase/ && git commit -m "feat: init supabase migrations + profiles table"
```

---

### Task 2: Create remaining tables (addresses, reviews, favorites, cart, loyalty)

**Files:**
- Create: `supabase/migrations/00002_create_addresses.sql`
- Create: `supabase/migrations/00003_create_reviews.sql`
- Create: `supabase/migrations/00004_create_favorites.sql`
- Create: `supabase/migrations/00005_create_cart_items.sql`
- Create: `supabase/migrations/00006_create_loyalty_rewards.sql`
- Create: `supabase/migrations/00007_add_user_id_to_orders.sql`

**Step 1: Addresses**

```sql
create table public.addresses (
  id uuid default uuid_generate_v4() primary key,
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
```

**Step 2: Reviews**

```sql
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
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
```

**Step 3: Favorites**

```sql
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
```

**Step 4: Cart items**

```sql
create table public.cart_items (
  id uuid default uuid_generate_v4() primary key,
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
```

**Step 5: Loyalty rewards**

```sql
create table public.loyalty_rewards (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  points_cost integer not null,
  reward_type text not null check (reward_type in ('discount', 'shipping', 'access')),
  value numeric, -- montant de la réduction en euros
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Seeded data
insert into public.loyalty_rewards (name, description, points_cost, reward_type, value) values
  ('Bon de 5€', 'Réduction de 5€ sur votre prochaine commande', 100, 'discount', 5),
  ('Livraison offerte', 'Livraison gratuite sur votre prochaine commande', 250, 'shipping', 5.90),
  ('Bon de 15€', 'Réduction de 15€ sur votre prochaine commande', 500, 'discount', 15),
  ('Accès ventes privées', 'Accès exclusif aux ventes privées LOLETT', 1000, 'access', null);

-- Public read, admin write
alter table public.loyalty_rewards enable row level security;

create policy "Anyone can view active rewards"
  on public.loyalty_rewards for select
  using (is_active = true);
```

**Step 6: Add user_id to orders**

```sql
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;

create index idx_orders_user_id on public.orders(user_id);
```

**Step 7: Push all migrations**

Run: `supabase db push`

**Step 8: Commit**

```bash
git add supabase/ && git commit -m "feat: create addresses, reviews, favorites, cart, loyalty tables"
```

---

### Task 3: Enable Google OAuth in Supabase

**Manual step in Supabase Dashboard:**
1. Go to Authentication > Providers > Google
2. Enable Google provider
3. Add Google Client ID and Secret (from Google Cloud Console)
4. Set redirect URL: `https://utgwrfqnaoggckfruzzo.supabase.co/auth/v1/callback`

**No code needed — just dashboard config.**

---

### Task 4: Middleware + Auth context

**Files:**
- Create: `middleware.ts` (project root: `lolett-app/middleware.ts`)
- Create: `lib/supabase/middleware.ts`
- Create: `lib/auth/context.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create Supabase middleware helper**

Create `lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = ['/compte'];
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ['/connexion', '/inscription'];
  const isAuthPage = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/compte';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**Step 2: Create root middleware**

Create `lolett-app/middleware.ts`:

```typescript
import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Step 3: Create auth context provider**

Create `lib/auth/context.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContext {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContext>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Step 4: Add AuthProvider to layout**

Modify `app/layout.tsx` — wrap `<SiteChrome>` with `<AuthProvider>`:

```typescript
import { AuthProvider } from '@/lib/auth/context';

// In RootLayout body:
<body className="font-body antialiased">
  <AuthProvider>
    <SiteChrome>{children}</SiteChrome>
  </AuthProvider>
</body>
```

**Step 5: Commit**

```bash
git add middleware.ts lib/supabase/middleware.ts lib/auth/context.tsx app/layout.tsx
git commit -m "feat: add auth middleware + context provider"
```

---

## Phase 2: Auth Pages (Connexion / Inscription)

### Task 5: Types utilisateur

**Files:**
- Modify: `types/index.ts`

**Step 1: Add user-related types**

```typescript
export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserReview {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  flagged: boolean;
  flagCount: number;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  productName?: string;
  productImage?: string;
  authorName?: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  rewardType: 'discount' | 'shipping' | 'access';
  value: number | null;
  isActive: boolean;
}
```

**Step 2: Commit**

```bash
git add types/index.ts && git commit -m "feat: add user, address, review, loyalty types"
```

---

### Task 6: Page Connexion (`/connexion`)

**Files:**
- Create: `app/connexion/page.tsx`
- Create: `components/auth/LoginForm.tsx`

**Step 1: LoginForm component**

Create `components/auth/LoginForm.tsx` — form with email/password + Google OAuth button. Design: fond sombre premium, accents or #c4a44e, polices Playfair + DM Sans.

Fields: email, password, "Se connecter" button, "Connexion avec Google" button, lien vers `/inscription`, lien "Mot de passe oublié" vers `/mot-de-passe-oublie`.

Uses `createClient()` from `lib/supabase/client.ts`:
- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })`

On success: redirect to `/compte` (or `searchParams.redirect`).

**Step 2: Auth callback route**

Create `app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/compte';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
```

**Step 3: Connexion page**

Create `app/connexion/page.tsx` — server component with metadata, renders `<LoginForm />`.

**Step 4: Commit**

```bash
git add app/connexion/ components/auth/ app/auth/
git commit -m "feat: add login page with email + Google OAuth"
```

---

### Task 7: Page Inscription (`/inscription`)

**Files:**
- Create: `app/inscription/page.tsx`
- Create: `components/auth/RegisterForm.tsx`

Same premium dark design. Fields: prénom, nom, email, password, confirm password.

Uses `supabase.auth.signUp({ email, password, options: { data: { first_name, last_name } } })`.

On success: show "Vérifiez votre email" message.

**Commit after implementation.**

---

### Task 8: Mot de passe oublié (`/mot-de-passe-oublie`)

**Files:**
- Create: `app/mot-de-passe-oublie/page.tsx`
- Create: `components/auth/ForgotPasswordForm.tsx`
- Create: `app/reset-password/page.tsx`
- Create: `components/auth/ResetPasswordForm.tsx`

Uses `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`.

Reset page uses `supabase.auth.updateUser({ password })`.

**Commit after implementation.**

---

### Task 9: Update Header — user state

**Files:**
- Modify: `components/layout/SiteChrome.tsx` (or wherever the header/nav is)

Add to header:
- If not logged in: "Connexion" link icon
- If logged in: user avatar/initials dropdown with links to `/compte`, "Déconnexion"
- Logout: `supabase.auth.signOut()` then `router.refresh()`

**Commit after implementation.**

---

## Phase 3: Dashboard Compte (fond clair)

### Task 10: Layout compte + navigation

**Files:**
- Create: `app/compte/layout.tsx`
- Create: `app/compte/page.tsx` (redirect to `/compte/profil`)
- Create: `components/compte/CompteNav.tsx`

Layout: fond clair (#faf9f7), sidebar navigation dorée. Links:
- Mon profil
- Mes commandes
- Mes adresses
- Mes favoris
- Mon panier
- Mes avis
- Programme fidélité
- Déconnexion

**Commit after implementation.**

---

### Task 11: Page Profil (`/compte/profil`)

**Files:**
- Create: `app/compte/profil/page.tsx`
- Create: `components/compte/ProfileForm.tsx`
- Create: `lib/adapters/supabase-user.ts` (user repository)

Repository functions:
- `getProfile(userId)` — fetch from `profiles`
- `updateProfile(userId, data)` — update `profiles`

Form: prénom, nom, téléphone, avatar upload (Supabase Storage).

**Commit after implementation.**

---

### Task 12: Page Adresses (`/compte/adresses`)

**Files:**
- Create: `app/compte/adresses/page.tsx`
- Create: `components/compte/AddressList.tsx`
- Create: `components/compte/AddressForm.tsx`

Repository functions in `lib/adapters/supabase-user.ts`:
- `getAddresses(userId)`
- `createAddress(userId, data)`
- `updateAddress(id, data)`
- `deleteAddress(id)`
- `setDefaultAddress(userId, addressId)`

**Commit after implementation.**

---

### Task 13: Page Commandes (`/compte/commandes`)

**Files:**
- Create: `app/compte/commandes/page.tsx`
- Create: `app/compte/commandes/[id]/page.tsx`
- Create: `components/compte/OrderList.tsx`
- Create: `components/compte/OrderDetail.tsx`

Fetch orders where `user_id = auth.uid()`. Show status timeline (en préparation → expédié → livré).

**Commit after implementation.**

---

### Task 14: Favoris sync serveur

**Files:**
- Modify: `features/favorites/store.ts`
- Create: `features/favorites/sync.ts`

Strategy:
- Keep Zustand store for immediate UI updates
- On auth state change (login): merge localStorage favorites → server, then load server state
- On add/remove: update both local + server (if authenticated)
- `syncFavorites(userId)` function

**Commit after implementation.**

---

### Task 15: Panier persistant serveur

**Files:**
- Modify: `features/cart/store.ts`
- Create: `features/cart/sync.ts`

Same hybrid strategy as favorites:
- localStorage for guests
- Server sync for authenticated users
- Merge on login (sum quantities, keep newest addedAt)

**Commit after implementation.**

---

### Task 16: Page Avis (`/compte/avis`)

**Files:**
- Create: `app/compte/avis/page.tsx`
- Create: `components/compte/ReviewList.tsx`

List user's reviews with edit/delete actions.

**Commit after implementation.**

---

### Task 17: Avis sur page produit

**Files:**
- Modify: `app/produit/[slug]/page.tsx`
- Create: `components/product/ReviewSection.tsx`
- Create: `components/product/ReviewForm.tsx`

Show reviews on product page. If user is logged in + has bought the product, show review form. Flag button for other users.

**Commit after implementation.**

---

### Task 18: Admin modération avis

**Files:**
- Create: `app/admin/reviews/page.tsx`
- Create: `components/admin/ReviewModeration.tsx`

Admin page listing flagged reviews. Actions: approve (unflag), delete.

**Commit after implementation.**

---

## Phase 4: Programme Fidélité

### Task 19: Widget fidélité + page récompenses

**Files:**
- Create: `app/compte/fidelite/page.tsx`
- Create: `components/compte/LoyaltyWidget.tsx`
- Create: `components/compte/RewardsList.tsx`

Widget: barre de progression vers le prochain palier, points actuels.
Page: liste des récompenses disponibles avec bouton "Échanger".

Points attribution: on order status change to `delivered`, add `order.total` (arrondi) en points au profil.

**Commit after implementation.**

---

## Phase 5: Recommandations Personnalisées

### Task 20: Recommandations

**Files:**
- Create: `lib/recommendations.ts`
- Create: `components/product/RecommendedSection.tsx`
- Modify: `app/page.tsx` (add "Pour vous" section if logged in)

Logic:
1. Fetch user's order history + favorites
2. Extract categories and tags from those products
3. Query products matching those categories/tags, excluding already bought
4. Return top 8 results

**Commit after implementation.**

---

## Phase 6: Checkout integration

### Task 21: Link checkout to user account

**Files:**
- Modify: `features/checkout/components/CheckoutForm.tsx`
- Modify: `features/checkout/hooks/useCheckout.ts`

If user is authenticated:
- Pre-fill form with profile data + default address
- Save `user_id` on order creation
- Award loyalty points after delivery

**Commit after implementation.**

---

Plan complete and saved to `docs/plans/2026-02-20-espace-client.md`.

**Two execution options:**

1. **Subagent-Driven (this session)** — I dispatch fresh subagent per task, review between tasks, fast iteration
2. **Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

Which approach?
