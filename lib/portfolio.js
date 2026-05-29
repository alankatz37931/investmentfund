import { getFund, getPartners, getPositions } from './db';
import { getQuotes } from './alpaca';

/**
 * Portfolio = posiciones + cash sentado en la cuenta del fondo.
 *
 * Modelo de socios y gerencia:
 *  - Un fondo puede tener (opcionalmente) un socio marcado como gerente (`is_manager`).
 *  - Sin gerente partner: la performance fee se "diverte" al gerente externo (Alan).
 *  - Con gerente partner:
 *      - Los socios NO gerentes pagan la performance fee sobre su porción de ganancia.
 *      - El gerente NO paga fee sobre su porción.
 *      - Los fees cobrados a los demás socios se SUMAN a la ganancia neta del gerente.
 *
 * Distribución pro-rata por capital aportado.
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

  const managerPartner = partners.find((p) => p.is_manager);

  // Compute per-partner pro-rata gain, and fee paid by each non-manager
  let totalPerfFeeCollected = 0;
  const enrichedPartners = partners.map((p) => {
    const capital = Number(p.capital_contributed);
    const share = totalLpCapital > 0 ? capital / totalLpCapital : 0;
    const proRataGain = grossPnl * share;
    const isManager = !!p.is_manager;

    let feePaid = 0;
    if (!isManager && proRataGain > 0) {
      feePaid = proRataGain * perfFeePct;
      totalPerfFeeCollected += feePaid;
    }

    return {
      id: p.id,
      name: p.name,
      isManager,
      capitalContributed: capital,
      shareOfFundPct: share * 100,
      netPnl: proRataGain - feePaid, // base; manager will get +collected below
    };
  });

  // If there's a manager partner, the collected fees flow to them
  if (managerPartner) {
    const mgr = enrichedPartners.find((p) => p.isManager);
    if (mgr) mgr.netPnl += totalPerfFeeCollected;
  }

  // Final currentValue per partner
  enrichedPartners.forEach((p) => {
    p.currentValue = p.capitalContributed + p.netPnl;
  });

  // Fund-wide commission:
  //  - With manager partner: equals collected fees (redistributed internally)
  //  - Without manager partner: traditional formula (goes to external Alan)
  const performanceFee = managerPartner
    ? totalPerfFeeCollected
    : grossPnl > 0
      ? grossPnl * perfFeePct
      : 0;

  // Net PnL for LPs (non-manager only)
  const netPnlForLps = enrichedPartners
    .filter((p) => !p.isManager)
    .reduce((acc, p) => acc + p.netPnl, 0);

  const annualManagementFee = totalLpCapital * mgmtFeePct;

  return {
    generatedAt: new Date().toISOString(),
    fund: {
      id: fund.id,
      name: fund.name,
      managementFeePct: Number(fund.management_fee_pct),
      performanceFeePct: Number(fund.performance_fee_pct),
      cashBalance,
      hasManagerPartner: !!managerPartner,
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
