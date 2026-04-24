import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json({ error: 'disabled outside prod' }, { status: 403 });
  }
  throw new Error('Sentry test — this error is intentional.');
}
