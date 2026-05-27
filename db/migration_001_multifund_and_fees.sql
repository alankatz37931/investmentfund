-- Migración 001: Multi-fondo + manager fees
-- Idempotente — seguro re-ejecutar. Ejecutar en Neon SQL Editor.

-- 1. Crear tabla funds (cada fondo con su mgmt fee y performance fee)
CREATE TABLE IF NOT EXISTS funds (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  management_fee_pct NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (management_fee_pct >= 0 AND management_fee_pct <= 100),
  performance_fee_pct NUMERIC(5, 2) NOT NULL DEFAULT 20
    CHECK (performance_fee_pct >= 0 AND performance_fee_pct <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Crear el primer fondo (id=1) con defaults 0/20
INSERT INTO funds (id, name, management_fee_pct, performance_fee_pct)
VALUES (1, 'Fondo Principal', 0, 20)
ON CONFLICT (id) DO NOTHING;

-- Resetear la secuencia por si insertamos manualmente id=1
SELECT setval(pg_get_serial_sequence('funds', 'id'),
              GREATEST(1, (SELECT COALESCE(MAX(id), 1) FROM funds)));

-- 3. Eliminar participation_pct de partners (ahora se deriva de capital)
ALTER TABLE partners DROP COLUMN IF EXISTS participation_pct;

-- 4. Agregar fund_id como FK en las 3 tablas de datos
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS fund_id INTEGER REFERENCES funds(id) ON DELETE CASCADE;
ALTER TABLE positions
  ADD COLUMN IF NOT EXISTS fund_id INTEGER REFERENCES funds(id) ON DELETE CASCADE;
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS fund_id INTEGER REFERENCES funds(id) ON DELETE CASCADE;

-- 5. Backfill: filas existentes pertenecen al fondo 1
UPDATE partners     SET fund_id = 1 WHERE fund_id IS NULL;
UPDATE positions    SET fund_id = 1 WHERE fund_id IS NULL;
UPDATE transactions SET fund_id = 1 WHERE fund_id IS NULL;

-- 6. NOT NULL
ALTER TABLE partners     ALTER COLUMN fund_id SET NOT NULL;
ALTER TABLE positions    ALTER COLUMN fund_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN fund_id SET NOT NULL;

-- 7. Reemplazar UNIQUE(ticker) global por UNIQUE(fund_id, ticker)
--    Permite que múltiples fondos tengan AAPL al mismo tiempo
ALTER TABLE positions DROP CONSTRAINT IF EXISTS positions_ticker_key;
ALTER TABLE positions DROP CONSTRAINT IF EXISTS positions_fund_id_ticker_key;
ALTER TABLE positions ADD CONSTRAINT positions_fund_id_ticker_key UNIQUE (fund_id, ticker);

-- 8. Índices para queries scopeadas por fondo
CREATE INDEX IF NOT EXISTS idx_partners_fund     ON partners(fund_id);
CREATE INDEX IF NOT EXISTS idx_positions_fund    ON positions(fund_id);
CREATE INDEX IF NOT EXISTS idx_transactions_fund ON transactions(fund_id);

-- 9. (Opcional) Eliminar el "Managing Partner" del seed — el manager no es LP.
-- Descomentar para limpiar:
-- DELETE FROM partners WHERE name ILIKE '%Managing Partner%' AND fund_id = 1;
