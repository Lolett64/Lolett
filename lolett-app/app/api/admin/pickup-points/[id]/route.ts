import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const PickupPointPatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(300).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  city: z.string().min(1).max(120).optional(),
  country: z.string().min(2).max(2).optional(),
  hours: z.string().max(500).nullable().optional(),
  instructions: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pickup_points')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Point de retrait introuvable' }, { status: 404 });
  }
  return NextResponse.json({ pickupPoint: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const raw = await request.json().catch(() => null);
  const parsed = PickupPointPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updatePayload.name = body.name;
  if (body.address !== undefined) updatePayload.address = body.address;
  if (body.postalCode !== undefined) updatePayload.postal_code = body.postalCode;
  if (body.city !== undefined) updatePayload.city = body.city;
  if (body.country !== undefined) updatePayload.country = body.country;
  if (body.hours !== undefined) updatePayload.hours = body.hours;
  if (body.instructions !== undefined) updatePayload.instructions = body.instructions;
  if (body.isActive !== undefined) updatePayload.is_active = body.isActive;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pickup_points')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pickupPoint: data });
}
