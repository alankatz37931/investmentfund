import { sql } from '@vercel/postgres';

// ---------- Funds ----------

export async function getFunds() {
  const { rows } = await sql`
    SELECT id, name, management_fee_pct, performance_fee_pct, cash_balance, created_at
    FROM funds
    ORDER BY id ASC
  `;
  return rows;
}

export async function getFund(id) {
  const { rows } = await sql`
    SELECT id, name, management_fee_pct, performance_fee_pct, cash_balance, created_at
    FROM funds
    WHERE id = ${id}
  `;
  return rows[0] || null;
}

export async function createFund({ name, management_fee_pct, performance_fee_pct, cash_balance }) {
  const { rows } = await sql`
    INSERT INTO funds (name, management_fee_pct, performance_fee_pct, cash_balance)
    VALUES (${name}, ${management_fee_pct ?? 0}, ${performance_fee_pct ?? 20}, ${cash_balance ?? 0})
    RETURNING *
  `;
  return rows[0];
}

export async function updateFund(id, { name, management_fee_pct, performance_fee_pct, cash_balance }) {
  const { rows } = await sql`
    UPDATE funds
    SET name = ${name},
        management_fee_pct = ${management_fee_pct},
        performance_fee_pct = ${performance_fee_pct},
        cash_balance = ${cash_balance}
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
    SELECT id, fund_id, name, capital_contributed, is_manager, created_at
    FROM partners
    WHERE fund_id = ${fundId}
    ORDER BY is_manager DESC, capital_contributed DESC, name ASC
  `;
  return rows;
}

export async function createPartner({ fund_id, name, capital_contributed, is_manager }) {
  // Si se marca como gerente, primero desmarcar cualquier gerente existente en el fondo
  if (is_manager) {
    await sql`UPDATE partners SET is_manager = FALSE WHERE fund_id = ${fund_id} AND is_manager = TRUE`;
  }
  const { rows } = await sql`
    INSERT INTO partners (fund_id, name, capital_contributed, is_manager)
    VALUES (${fund_id}, ${name}, ${capital_contributed}, ${!!is_manager})
    RETURNING *
  `;
  return rows[0];
}

export async function updatePartner(id, { name, capital_contributed, is_manager }) {
  // Si se marca como gerente, desmarcar cualquier otro gerente del mismo fondo
  if (is_manager) {
    await sql`
      UPDATE partners
      SET is_manager = FALSE
      WHERE fund_id = (SELECT fund_id FROM partners WHERE id = ${id})
        AND is_manager = TRUE
        AND id != ${id}
    `;
  }
  const { rows } = await sql`
    UPDATE partners
    SET name = ${name},
        capital_contributed = ${capital_contributed},
        is_manager = ${!!is_manager}
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
