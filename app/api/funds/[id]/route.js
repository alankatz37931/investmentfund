import { NextResponse } from 'next/server';
import { getFund, updateFund, deleteFund } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const fund = await getFund(Number(id));
    if (!fund) {
      return NextResponse.json({ error: 'Fondo no encontrado' }, { status: 404 });
    }
    return NextResponse.json(fund);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const fund = await updateFund(Number(id), {
      name: String(body.name).trim(),
      management_fee_pct: Number(body.management_fee_pct),
      performance_fee_pct: Number(body.performance_fee_pct),
      cash_balance: Number(body.cash_balance) || 0,
    });
    if (!fund) {
      return NextResponse.json({ error: 'Fondo no encontrado' }, { status: 404 });
    }
    return NextResponse.json(fund);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    await deleteFund(Number(id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
