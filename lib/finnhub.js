const FINNHUB_BASE = 'https://finnhub.io/api/v1';

/**
 * Obtiene la cotización actual de un ticker desde Finnhub.
 * Respuesta de Finnhub: { c: current, d: change, dp: change%, h: high, l: low, o: open, pc: prev close }
 */
export async function getQuote(ticker) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY no está configurada en variables de entorno');
  }

  const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(`Finnhub respondió ${res.status} para ${ticker}`);
  }

  const data = await res.json();

  return {
    ticker,
    currentPrice: Number(data.c) || 0,
    change: Number(data.d) || 0,
    changePct: Number(data.dp) || 0,
    previousClose: Number(data.pc) || 0,
  };
}

export async function getQuotes(tickers) {
  if (!tickers.length) return {};
  const quotes = await Promise.all(tickers.map((t) => getQuote(t)));
  return Object.fromEntries(quotes.map((q) => [q.ticker, q]));
}
