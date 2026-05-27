-- Esquema de base de datos para Investment Fund MVP
-- Ejecutar en Vercel Postgres (pestaña "Query") o via psql

CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capital_contributed NUMERIC(14, 2) NOT NULL,
  participation_pct NUMERIC(5, 2) NOT NULL CHECK (participation_pct >= 0 AND participation_pct <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  type VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity NUMERIC(14, 4) NOT NULL,
  price NUMERIC(14, 4) NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) UNIQUE NOT NULL,
  quantity NUMERIC(14, 4) NOT NULL,
  avg_buy_price NUMERIC(14, 4) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_ticker ON transactions(ticker);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_positions_ticker ON positions(ticker);
