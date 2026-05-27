import { getFund, getPartners, getPositions } from './db';
import { getQuotes } from './finnhub';

/**
 * Portfolio = posiciones + cash sentado en la cuenta del fondo.
 *
 * Ganancia bruta = (posiciones a precio actual + cash) − capital aportado por socios
 * Performance fee = % sobre ganancia positiva (sale antes de distribuir a socios)
 * Ganancia para socios = (ganancia bruta − performance fee), pro-rata por capital aportado
 */
export async function getPortfolio(fundId) {
  const id = Number(fundId);
  const [fund, partners, positions] = await Promise.all([
    getFund(id),
    getPartners(id),
    getPositions(id),
  ]);

  if (!fund) {
    throw new Error(`Fondo ${fundId} no encontrado`);
  }

  const mgmtFeePct = Number(fund.management_fee_pct) / 100;
  const perfFeePct = Number(fund.performance_fee_pct) / 100;
  const cashBalance = Number(fund.cash_balance) || 0;

  const tickers = positions.map((p) => p.ticker);
  const quotes = await getQuotes(tickers);

  let totalCost = 0;
  let positionsMarketValue = 0;

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
    positionsMarketValue += marketValue;

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

  const totalFundValue = positionsMarketValue + cashBalance;

  const totalLpCapital = partners.reduce(
    (acc, p) => acc + Number(p.capital_contributed),
    0
  );

  const grossPnl = totalFundValue - totalLpCapital;
  const grossPnlPct = totalLpCapital > 0 ? (grossPnl / totalLpCapital) * 100 : 0;

  const performanceFee = grossPnl > 0 ? grossPnl * perfFeePct : 0;
  const annualManagementFee = totalLpCapital * mgmtFeePct;
  const netPnlForLps = grossPnl - performanceFee;

  const enrichedPartners = partners.map((p) => {
    const capital = Number(p.capital_contributed);
    const share = totalLpCapital > 0 ? capital / totalLpCapital : 0;
    const netPnl = netPnlForLps * share;
    return {
      id: p.id,
      name: p.name,
      capitalContributed: capital,
      shareOfFundPct: share * 100,
      netPnl,
      currentValue: capital + netPnl,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    fund: {
      id: fund.id,
      name: fund.name,
      managementFeePct: Number(fund.management_fee_pct),
      performanceFeePct: Number(fund.performance_fee_pct),
      cashBalance,
    },
    totals: {
      totalLpCapital,
      totalCost,
      positionsMarketValue,
      cashBalance,
      totalFundValue,
      grossPnl,
      grossPnlPct,
      performanceFee,
      annualManagementFee,
      netPnlForLps,
    },
    positions: enrichedPositions,
    partners: enrichedPartners,
  };
}
