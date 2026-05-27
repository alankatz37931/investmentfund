import { NextResponse } from 'next/server';
import { getPositions, createPosition } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getPositions();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { ticker, quantity, avg_buy_price } = body;

    if (!ticker || quantity == null || avg_buy_price == null) {
      return NextResponse.json(
        { error: 'Faltan campos: ticker, quantity, avg_buy_price' },
        { status: 400 }
      );
    }

    const position = await createPosition({
      ticker: String(ticker).trim(),
      quantity: Number(quantity),
      avg_buy_price: Number(avg_buy_price),
    });

    return NextResponse.json(position, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
