import { NextResponse } from 'next/server';
import { getFunds, createFund } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getFunds();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, management_fee_pct, performance_fee_pct } = body;

    if (!name) {
      return NextResponse.json({ error: 'Falta el campo: name' }, { status: 400 });
    }

    const fund = await createFund({
      name: String(name).trim(),
      management_fee_pct:
        management_fee_pct != null ? Number(management_fee_pct) : 0,
      performance_fee_pct:
        performance_fee_pct != null ? Number(performance_fee_pct) : 20,
    });

    return NextResponse.json(fund, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
