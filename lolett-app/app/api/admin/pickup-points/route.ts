import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const PickupPointCreateSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(300),
  postalCode: z.string().min(1).max(20),
  city: z.string().min(1).max(120),
  country: z.string().min(2).max(2).default('FR'),
  hours: z.string().max(500).nullable().optional(),
  instructions: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pickup_points')
    .select('*')
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pickupPoints: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = PickupPointCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;
  const supabase = createAdminClient();

  // sort_order = MAX + 10 (init par pas de 10, cf. spec §4.1 / §7.3)
  const { data: maxRows, error: maxError } = await supabase
    .from('pickup_points')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  if (maxError) return NextResponse.json({ error: maxError.message }, { status: 500 });
  const currentMax = maxRows?.[0]?.sort_order ?? 0;
  const sortOrder = currentMax + 10;

  const { data, error } = await supabase
    .from('pickup_points')
    .insert({
      name: body.name,
      address: body.address,
      postal_code: body.postalCode,
      city: body.city,
      country: body.country,
      hours: body.hours ?? null,
      instructions: body.instructions ?? null,
      is_active: body.isActive ?? false,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pickupPoint: data });
}
