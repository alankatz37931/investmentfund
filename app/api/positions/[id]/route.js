import { NextResponse } from 'next/server';
import { updatePosition, deletePosition } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const position = await updatePosition(Number(id), {
      ticker: String(body.ticker).trim(),
      quantity: Number(body.quantity),
      avg_buy_price: Number(body.avg_buy_price),
    });
    if (!position) {
      return NextResponse.json({ error: 'Posición no encontrada' }, { status: 404 });
    }
    return NextResponse.json(position);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    await deletePosition(Number(id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
