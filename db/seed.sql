-- Datos de ejemplo para arrancar el MVP
-- Ajusta nombres, capitales y posiciones a tu situación real

INSERT INTO partners (name, capital_contributed, participation_pct) VALUES
  ('Alan Katz (Managing Partner)', 50000.00, 50.00),
  ('Socio Inversor A',             30000.00, 30.00),
  ('Socio Inversor B',             20000.00, 20.00);

INSERT INTO positions (ticker, quantity, avg_buy_price) VALUES
  ('AAPL',  100, 175.50),
  ('MSFT',   50, 380.20),
  ('GOOGL',  30, 142.80),
  ('NVDA',   20, 480.00);

INSERT INTO transactions (ticker, type, quantity, price, notes) VALUES
  ('AAPL',  'BUY', 100, 175.50, 'Compra inicial'),
  ('MSFT',  'BUY',  50, 380.20, 'Compra inicial'),
  ('GOOGL', 'BUY',  30, 142.80, 'Compra inicial'),
  ('NVDA',  'BUY',  20, 480.00, 'Compra inicial');
