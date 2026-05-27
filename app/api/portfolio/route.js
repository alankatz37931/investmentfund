import { NextResponse } from 'next/server';
import { getPartners, getPositions } from '@/lib/db';
import { getQuotes } from '@/lib/finnhub';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [partners, positions] = await Promise.all([
      getPartners(),
      getPositions(),
    ]);

    const tickers = positions.map((p) => p.ticker);
    const quotes = await getQuotes(tickers);

    let totalCost = 0;
    let totalMarketValue = 0;

    const enrichedPositions = positions.map((p) => {
      const q = quotes[p.ticker] || { currentPrice: 0, changePct: 0 };
      const quantity = Number(p.quantity);
      const avgBuy = Number(p.avg_buy_price);
      const currentPrice = Number(q.currentPrice);

      const cost = quantity * avgBuy;
      const marketValue = quantity * currentPrice;
      const pnl = marketValue - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;

      totalCost += cost;
      totalMarketValue += marketValue;

      return {
        ticker: p.ticker,
        quantity,
        avgBuyPrice: avgBuy,
        currentPrice,
        cost,
        marketValue,
        pnl,
        pnlPct,
        dayChangePct: Number(q.changePct),
      };
    });

    const totalPnl = totalMarketValue - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    const totalCapital = partners.reduce(
      (acc, p) => acc + Number(p.capital_contributed),
      0
    );

    // Distribución matemática del P&L según participación
    const enrichedPartners = partners.map((p) => {
      const pct = Number(p.participation_pct) / 100;
      const partnerPnl = totalPnl * pct;
      const currentValue = Number(p.capital_contributed) + partnerPnl;
      return {
        id: p.id,
        name: p.name,
        capitalContributed: Number(p.capital_contributed),
        participationPct: Number(p.participation_pct),
        pnl: partnerPnl,
        currentValue,
      };
    });

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      totals: {
        totalCost,
        totalMarketValue,
        totalPnl,
        totalPnlPct,
        totalCapital,
      },
      positions: enrichedPositions,
      partners: enrichedPartners,
    });
  } catch (err) {
    console.error('[/api/portfolio] error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
