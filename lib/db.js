import { sql } from '@vercel/postgres';

// ---------- Funds ----------

export async function getFunds() {
  const { rows } = await sql`
    SELECT id, name, management_fee_pct, performance_fee_pct, created_at
    FROM funds
    ORDER BY id ASC
  `;
  return rows;
}

export async function getFund(id) {
  const { rows } = await sql`
    SELECT id, name, management_fee_pct, performance_fee_pct, created_at
    FROM funds
    WHERE id = ${id}
  `;
  return rows[0] || null;
}

export async function createFund({ name, management_fee_pct, performance_fee_pct }) {
  const { rows } = await sql`
    INSERT INTO funds (name, management_fee_pct, performance_fee_pct)
    VALUES (${name}, ${management_fee_pct ?? 0}, ${performance_fee_pct ?? 20})
    RETURNING *
  `;
  return rows[0];
}

export async function updateFund(id, { name, management_fee_pct, performance_fee_pct }) {
  const { rows } = await sql`
    UPDATE funds
    SET name = ${name},
        management_fee_pct = ${management_fee_pct},
        performance_fee_pct = ${performance_fee_pct}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] || null;
}

export async function deleteFund(id) {
  await sql`DELETE FROM funds WHERE id = ${id}`;
}

// ---------- Partners (LPs) ----------

export async function getPartners(fundId) {
  const { rows } = await sql`
    SELECT id, fund_id, name, capital_contributed, created_at
    FROM partners
    WHERE fund_id = ${fundId}
    ORDER BY capital_contributed DESC, name ASC
  `;
  return rows;
}

export async function createPartner({ fund_id, name, capital_contributed }) {
  const { rows } = await sql`
    INSERT INTO partners (fund_id, name, capital_contributed)
    VALUES (${fund_id}, ${name}, ${capital_contributed})
    RETURNING *
  `;
  return rows[0];
}

export async function updatePartner(id, { name, capital_contributed }) {
  const { rows } = await sql`
    UPDATE partners
    SET name = ${name},
        capital_contributed = ${capital_contributed}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] || null;
}

export async function deletePartner(id) {
  await sql`DELETE FROM partners WHERE id = ${id}`;
}

// ---------- Positions ----------

export async function getPositions(fundId) {
  const { rows } = await sql`
    SELECT id, fund_id, ticker, quantity, avg_buy_price, updated_at
    FROM positions
    WHERE fund_id = ${fundId}
    ORDER BY ticker ASC
  `;
  return rows;
}

export async function createPosition({ fund_id, ticker, quantity, avg_buy_price }) {
  const { rows } = await sql`
    INSERT INTO positions (fund_id, ticker, quantity, avg_buy_price)
    VALUES (${fund_id}, ${ticker.toUpperCase()}, ${quantity}, ${avg_buy_price})
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
  return rows[0] || null;
}

export async function deletePosition(id) {
  await sql`DELETE FROM positions WHERE id = ${id}`;
}
