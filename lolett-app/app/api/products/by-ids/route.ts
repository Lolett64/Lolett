import { NextRequest, NextResponse } from 'next/server';
import { productRepository } from '@/lib/adapters';

export async function POST(req: NextRequest) {
  const { ids } = (await req.json()) as { ids: string[] };
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ products: [] });
  }
  const products = await productRepository.findByIds(ids);
  return NextResponse.json({ products });
}
