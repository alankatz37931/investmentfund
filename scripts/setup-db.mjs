// Script opcional para crear el esquema desde local (lee POSTGRES_URL_NON_POOLING)
// Uso: node scripts/setup-db.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sql } from '@vercel/postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
  const schema = readFileSync(join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    console.log('→', stmt.split('\n')[0]);
    await sql.query(stmt);
  }
  console.log('Esquema creado.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
