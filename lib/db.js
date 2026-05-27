import { sql } from '@vercel/postgres';

// ---------- Partners ----------

export async function getPartners() {
  const { rows } = await sql`
    SELECT id, name, capital_contributed, participation_pct, created_at
    FROM partners
    ORDER BY participation_pct DESC, name ASC
  `;
  return rows;
}

export async function createPartner({ name, capital_contributed, participation_pct }) {
  const { rows } = await sql`
    INSERT INTO partners (name, capital_contributed, participation_pct)
    VALUES (${name}, ${capital_contributed}, ${participation_pct})
    RETURNING *
  `;
  return rows[0];
}

export async function updatePartner(id, { name, capital_contributed, participation_pct }) {
  const { rows } = await sql`
    UPDATE partners
    SET name = ${name},
        capital_contributed = ${capital_contributed},
        participation_pct = ${participation_pct}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function deletePartner(id) {
  await sql`DELETE FROM partners WHERE id = ${id}`;
}

// ---------- Positions ----------

export async function getPositions() {
  const { rows } = await sql`
    SELECT id, ticker, quantity, avg_buy_price, updated_at
    FROM positions
    ORDER BY ticker ASC
  `;
  return rows;
}

export async function createPosition({ ticker, quantity, avg_buy_price }) {
  const { rows } = await sql`
    INSERT INTO positions (ticker, quantity, avg_buy_price)
    VALUES (${ticker.toUpperCase()}, ${quantity}, ${avg_buy_price})
    RETURNING *
  `;
  return rows[0];
}

export async function updatePosition(id, { ticker, quantity, avg_buy_price }) {
  const { rows } = await sql`
    UPDATE positions
    SET ticker = ${ticker.toUpperCase()},
        quantity = ${quantity},
        avg_buy_price = ${avg_buy_price},
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function deletePosition(id) {
  await sql`DELETE FROM positions WHERE id = ${id}`;
}

// ---------- Transactions ----------

export async function getTransactions(limit = 50) {
  const { rows } = await sql`
    SELECT id, ticker, type, quantity, price, transaction_date, notes
    FROM transactions
    ORDER BY transaction_date DESC
    LIMIT ${limit}
  `;
  return rows;
}
