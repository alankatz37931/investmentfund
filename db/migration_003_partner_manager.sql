-- Migración 003: Permitir que uno de los socios sea el gerente del fondo
-- El gerente no paga comisión sobre su ganancia, y RECIBE la comisión cobrada a los demás socios.
-- Idempotente — seguro re-ejecutar.

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS is_manager BOOLEAN NOT NULL DEFAULT FALSE;

-- Solo un socio por fondo puede ser gerente
CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_one_manager_per_fund
  ON partners(fund_id) WHERE is_manager = TRUE;
