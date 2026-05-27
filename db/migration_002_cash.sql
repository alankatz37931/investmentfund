-- Migración 002: Cash balance por fondo
-- Permite trackear plata no invertida (sentada en la cuenta) para ver el valor total real.
-- Idempotente — seguro re-ejecutar.

ALTER TABLE funds
  ADD COLUMN IF NOT EXISTS cash_balance NUMERIC(14, 2) NOT NULL DEFAULT 0;
