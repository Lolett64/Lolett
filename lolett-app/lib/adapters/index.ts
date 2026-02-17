export * from './types';
export * from './mock';

/**
 * LOLETT Data Adapters
 * ====================
 *
 * This module provides repository interfaces and mock implementations
 * for all data operations. When migrating to Supabase, create new
 * implementations of these interfaces.
 *
 * ## Supabase Migration Guide
 *
 * 1. Create Supabase tables matching these structures:
 *
 *    ```sql
 *    -- products table
 *    CREATE TABLE products (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      slug TEXT UNIQUE NOT NULL,
 *      name TEXT NOT NULL,
 *      gender TEXT NOT NULL CHECK (gender IN ('homme', 'femme')),
 *      category_slug TEXT NOT NULL,
 *      price NUMERIC NOT NULL,
 *      images TEXT[] NOT NULL,
 *      description TEXT,
 *      sizes TEXT[] NOT NULL,
 *      colors JSONB NOT NULL,
 *      stock INTEGER NOT NULL DEFAULT 0,
 *      is_new BOOLEAN DEFAULT FALSE,
 *      tags TEXT[],
 *      created_at TIMESTAMPTZ DEFAULT NOW(),
 *      updated_at TIMESTAMPTZ DEFAULT NOW()
 *    );
 *
 *    -- looks table
 *    CREATE TABLE looks (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      title TEXT NOT NULL,
 *      gender TEXT NOT NULL CHECK (gender IN ('homme', 'femme')),
 *      cover_image TEXT NOT NULL,
 *      product_ids UUID[] NOT NULL,
 *      vibe TEXT,
 *      short_pitch TEXT,
 *      created_at TIMESTAMPTZ DEFAULT NOW(),
 *      updated_at TIMESTAMPTZ DEFAULT NOW()
 *    );
 *
 *    -- categories table
 *    CREATE TABLE categories (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      gender TEXT NOT NULL CHECK (gender IN ('homme', 'femme')),
 *      slug TEXT NOT NULL,
 *      label TEXT NOT NULL,
 *      seo_title TEXT,
 *      seo_description TEXT,
 *      created_at TIMESTAMPTZ DEFAULT NOW(),
 *      UNIQUE(gender, slug)
 *    );
 *
 *    -- orders table
 *    CREATE TABLE orders (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      customer JSONB NOT NULL,
 *      total NUMERIC NOT NULL,
 *      shipping NUMERIC NOT NULL,
 *      status TEXT NOT NULL DEFAULT 'pending',
 *      created_at TIMESTAMPTZ DEFAULT NOW()
 *    );
 *
 *    -- order_items table
 *    CREATE TABLE order_items (
 *      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *      order_id UUID REFERENCES orders(id),
 *      product_id UUID REFERENCES products(id),
 *      product_name TEXT NOT NULL,
 *      size TEXT NOT NULL,
 *      quantity INTEGER NOT NULL,
 *      price NUMERIC NOT NULL
 *    );
 *    ```
 *
 * 2. Create new repository implementations:
 *
 *    ```typescript
 *    // lib/adapters/supabase.ts
 *    import { createClient } from '@supabase/supabase-js';
 *    import type { ProductRepository } from './types';
 *
 *    const supabase = createClient(
 *      process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 *    );
 *
 *    export class SupabaseProductRepository implements ProductRepository {
 *      async findMany(options) {
 *        let query = supabase.from('products').select('*');
 *        if (options?.gender) query = query.eq('gender', options.gender);
 *        // ... implement filters
 *        const { data } = await query;
 *        return data || [];
 *      }
 *      // ... implement other methods
 *    }
 *    ```
 *
 * 3. Update exports to use Supabase implementations:
 *
 *    ```typescript
 *    // lib/adapters/index.ts
 *    export * from './supabase';
 *    ```
 */
