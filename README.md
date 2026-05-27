# Investment Fund — MVP

Sistema de gestión de portafolio y socios. Next.js (App Router) + Vercel Postgres + Tailwind + Finnhub.

## Setup local

1. `npm install`
2. Copia `.env.local.example` a `.env.local` y rellena las variables
3. `npm run dev`

## Setup de base de datos

En el dashboard de Vercel → tu proyecto → Storage → conecta una base de datos Postgres. Luego en la pestaña **Query** pega el contenido de `db/schema.sql` y ejecuta. Repite con `db/seed.sql` si quieres datos de ejemplo.

Alternativa local: con `POSTGRES_URL_NON_POOLING` configurado, ejecuta `npm run db:setup`.

## Estructura

```
app/
  api/portfolio/route.js   # Backend: trae cotizaciones y calcula P&L
  components/              # Componentes UI del dashboard
  layout.js
  page.js                  # Dashboard principal
  globals.css
lib/
  db.js                    # Queries a Vercel Postgres
  finnhub.js               # Cliente HTTP de Finnhub
db/
  schema.sql               # Esquema de tablas
  seed.sql                 # Datos de ejemplo
```

## Deploy en Vercel

1. Push del repo a GitHub
2. En Vercel: Import Project → seleccionar el repo
3. Storage → Create Database → Postgres → conectar al proyecto (esto inyecta las variables `POSTGRES_*`)
4. Settings → Environment Variables → añadir `FINNHUB_API_KEY`
5. Redeploy
