const ALPACA_DATA_BASE = 'https://data.alpaca.markets/v2';

function getHeaders() {
  const keyId = process.env.ALPACA_API_KEY_ID;
  const secret = process.env.ALPACA_API_SECRET_KEY;
  if (!keyId || !secret) {
    throw new Error(
      'ALPACA_API_KEY_ID o ALPACA_API_SECRET_KEY no están configurados'
    );
  }
  return {
    'APCA-API-KEY-ID': keyId,
    'APCA-API-SECRET-KEY': secret,
  };
}

/**
 * Trae snapshot multi-ticker de Alpaca: latest trade, daily bar, prev daily bar.
 * Free tier usa IEX feed → precios real-time durante 9:30-16:00 ET; limitado en
 * extended hours. Para SIP completo (todas las venues, full pre/after) hace falta
 * el plan paid de Alpaca.
 */
export async function getQuotes(tickers) {
  if (!tickers.length) return {};

  const symbols = tickers.map((t) => t.toUpperCase()).join(',');
  const url = `${ALPACA_DATA_BASE}/stocks/snapshots?symbols=${encodeURIComponent(
    symbols
  )}`;

  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 60, tags: ['portfolio'] },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Alpaca respondió ${res.status}: ${txt}`);
  }

  const data = await res.json();
  const result = {};

  for (const ticker of tickers) {
    const T = ticker.toUpperCase();
    const snap = data[T];

    if (!snap) {
      result[ticker] = {
        ticker,
        currentPrice: 0,
        change: 0,
        changePct: 0,
        previousClose: 0,
      };
      continue;
    }

    // Precio actual: latestTrade.p (último trade ejecutado) → fallback a dailyBar.c
    const latestPrice =
      snap.latestTrade?.p ?? snap.dailyBar?.c ?? snap.prevDailyBar?.c ?? 0;
    const prevClose = snap.prevDailyBar?.c ?? 0;
    const change = Number(latestPrice) - Number(prevClose);
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

    result[ticker] = {
      ticker,
      currentPrice: Number(latestPrice) || 0,
      change: Number(change) || 0,
      changePct: Number(changePct) || 0,
      previousClose: Number(prevClose) || 0,
    };
  }

  return result;
}

export async function getQuote(ticker) {
  const data = await getQuotes([ticker]);
  return (
    data[ticker] || {
      ticker,
      currentPrice: 0,
      change: 0,
      changePct: 0,
      previousClose: 0,
    }
  );
}
