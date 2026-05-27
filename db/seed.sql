-- Seed inicial: 1 fondo de ejemplo con 2 LPs y 4 posiciones
-- El MANAGER (Alan) no es LP — no aparece acá

INSERT INTO funds (id, name, management_fee_pct, performance_fee_pct)
VALUES (1, 'Fondo Principal', 0, 20)
ON CONFLICT (id) DO NOTHING;

INSERT INTO partners (fund_id, name, capital_contributed) VALUES
  (1, 'Socio Inversor A', 30000.00),
  (1, 'Socio Inversor B', 20000.00);

INSERT INTO positions (fund_id, ticker, quantity, avg_buy_price) VALUES
  (1, 'AAPL',  100, 175.50),
  (1, 'MSFT',   50, 380.20),
  (1, 'GOOGL',  30, 142.80),
  (1, 'NVDA',   20, 480.00);
