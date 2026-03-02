import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('materials')
    .select('name, icon')
    .eq('active', true)
    .order('sort_order');

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data);
}
