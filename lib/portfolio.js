import { getFund, getPartners, getPositions } from './db';
import { getQuotes } from './finnhub';

/**
 * Calcula el portfolio para un fondo específico.
 *
 * Modelo de fees (configurable por fondo):
 *  - performance_fee_pct: % de la ganancia bruta que se queda el manager
 *  - management_fee_pct: % anual sobre el AUM (informativo — no se deduce de P&L per-LP
 *    porque requiere trackear tiempo transcurrido; mostrar como referencia)
 *
 * Distribución a LPs (pro-rata por capital aportado):
 *   share_i        = capital_i / total_lp_capital
 *   net_pnl_pool   = gross_pnl - performance_fee
 *   net_pnl_i      = net_pnl_pool * share_i
 *   current_value_i = capital_i + net_pnl_i
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

  const grossPnl = totalMarketValue - totalCost;
  const grossPnlPct = totalCost > 0 ? (grossPnl / totalCost) * 100 : 0;

  const totalLpCapital = partners.reduce(
    (acc, p) => acc + Number(p.capital_contributed),
    0
  );

  // Performance fee solo sobre ganancias positivas
  const performanceFee = grossPnl > 0 ? grossPnl * perfFeePct : 0;
  // Management fee anual informativo (no se deduce del per-LP P&L)
  const annualManagementFee = totalLpCapital * mgmtFeePct;
  // Pool neto a distribuir entre LPs
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
    },
    totals: {
      totalLpCapital,
      totalCost,
      totalMarketValue,
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
