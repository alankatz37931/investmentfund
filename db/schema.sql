-- Esquema actual (multi-fondo + fees por fondo)
-- Para fresh install: ejecutar este archivo entero.
-- Para upgrade de un esquema viejo: ver db/migration_001_multifund_and_fees.sql

CREATE TABLE IF NOT EXISTS funds (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  management_fee_pct NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (management_fee_pct >= 0 AND management_fee_pct <= 100),
  performance_fee_pct NUMERIC(5, 2) NOT NULL DEFAULT 20
    CHECK (performance_fee_pct >= 0 AND performance_fee_pct <= 100),
  cash_balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  fund_id INTEGER NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  capital_contributed NUMERIC(14, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  fund_id INTEGER NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  ticker VARCHAR(10) NOT NULL,
  quantity NUMERIC(14, 4) NOT NULL,
  avg_buy_price NUMERIC(14, 4) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fund_id, ticker)
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  fund_id INTEGER NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
  ticker VARCHAR(10) NOT NULL,
  type VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity NUMERIC(14, 4) NOT NULL,
  price NUMERIC(14, 4) NOT NULL,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_partners_fund     ON partners(fund_id);
CREATE INDEX IF NOT EXISTS idx_positions_fund    ON positions(fund_id);
CREATE INDEX IF NOT EXISTS idx_transactions_fund ON transactions(fund_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ticker ON transactions(ticker);
CREATE INDEX IF NOT EXISTS idx_transactions_date   ON transactions(transaction_date DESC);
