import { NextResponse } from 'next/server';
import { getPartners, createPartner } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const fundId = req.nextUrl.searchParams.get('fund_id');
    if (!fundId) {
      return NextResponse.json({ error: 'Falta query param: fund_id' }, { status: 400 });
    }
    const data = await getPartners(Number(fundId));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { fund_id, name, capital_contributed } = body;

    if (!fund_id || !name || capital_contributed == null) {
      return NextResponse.json(
        { error: 'Faltan campos: fund_id, name, capital_contributed' },
        { status: 400 }
      );
    }

    const partner = await createPartner({
      fund_id: Number(fund_id),
      name: String(name).trim(),
      capital_contributed: Number(capital_contributed),
      is_manager: !!body.is_manager,
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
