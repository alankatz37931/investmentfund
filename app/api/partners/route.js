import { NextResponse } from 'next/server';
import { getPartners, createPartner } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getPartners();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, capital_contributed, participation_pct } = body;

    if (!name || capital_contributed == null || participation_pct == null) {
      return NextResponse.json(
        { error: 'Faltan campos: name, capital_contributed, participation_pct' },
        { status: 400 }
      );
    }

    const partner = await createPartner({
      name: String(name).trim(),
      capital_contributed: Number(capital_contributed),
      participation_pct: Number(participation_pct),
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
