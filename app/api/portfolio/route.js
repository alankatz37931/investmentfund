import { NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/portfolio';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getPortfolio();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[/api/portfolio] error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
