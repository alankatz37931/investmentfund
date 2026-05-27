import { NextResponse } from 'next/server';
import { updatePartner, deletePartner } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const partner = await updatePartner(Number(id), {
      name: String(body.name).trim(),
      capital_contributed: Number(body.capital_contributed),
      participation_pct: Number(body.participation_pct),
    });
    if (!partner) {
      return NextResponse.json({ error: 'Socio no encontrado' }, { status: 404 });
    }
    return NextResponse.json(partner);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    await deletePartner(Number(id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
