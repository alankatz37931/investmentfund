import { sql } from '@vercel/postgres';

export async function getPartners() {
  const { rows } = await sql`
    SELECT id, name, capital_contributed, participation_pct, created_at
    FROM partners
    ORDER BY participation_pct DESC, name ASC
  `;
  return rows;
}

export async function getPositions() {
  const { rows } = await sql`
    SELECT id, ticker, quantity, avg_buy_price, updated_at
    FROM positions
    ORDER BY ticker ASC
  `;
  return rows;
}

export async function getTransactions(limit = 50) {
  const { rows } = await sql`
    SELECT id, ticker, type, quantity, price, transaction_date, notes
    FROM transactions
    ORDER BY transaction_date DESC
    LIMIT ${limit}
  `;
  return rows;
}
