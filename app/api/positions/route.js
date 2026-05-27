import { NextResponse } from 'next/server';
import { getPositions, createPosition } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const fundId = req.nextUrl.searchParams.get('fund_id');
    if (!fundId) {
      return NextResponse.json({ error: 'Falta query param: fund_id' }, { status: 400 });
    }
    const data = await getPositions(Number(fundId));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { fund_id, ticker, quantity, avg_buy_price } = body;

    if (!fund_id || !ticker || quantity == null || avg_buy_price == null) {
      return NextResponse.json(
        { error: 'Faltan campos: fund_id, ticker, quantity, avg_buy_price' },
        { status: 400 }
      );
    }

    const position = await createPosition({
      fund_id: Number(fund_id),
      ticker: String(ticker).trim(),
      quantity: Number(quantity),
      avg_buy_price: Number(avg_buy_price),
    });

    return NextResponse.json(position, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
