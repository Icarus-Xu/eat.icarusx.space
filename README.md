# 吃什么 · What to Eat

A small personal web app for two people to record restaurants together and get a
"what should we eat today?" recommendation based on where you are. Deployed at
[eat.icarusx.space](https://eat.icarusx.space).

## Features

- **Recommendations** — given your location, suggests up to 3 nearby restaurants
  (mixing well-rated places you've been to with bookmarked ones you haven't).
- **Add restaurants** — search by name or paste an Amap / Baidu Maps share link;
  saves the POI with an optional visit + rating.
- **Map view** — interactive Amap or Baidu map; tap to pick a location.
- **Shared pool, separate visits** — both users share one restaurant list but keep
  their own visit records and ratings.
- **Warm Appetite theme** — warm-toned UI with light / dark mode.
- **Bilingual** — English / Simplified Chinese, auto-detected, switchable in Settings.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) · React · TypeScript
- PostgreSQL via the `postgres` library (raw SQL)
- NextAuth.js v5 (Credentials provider)
- Tailwind CSS · Heroicons · Zod
- Amap & Baidu Maps web + JS APIs
- pnpm · Docker · deployed on a Raspberry Pi 5 behind an frp tunnel

## Getting Started

Requires Node 20+ and pnpm (via Corepack). Install and run the dev server:

```bash
corepack pnpm install
corepack pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

On first run against a fresh database, hit `GET /migrate` once to create the tables.

### Environment variables

Create `.env.local` with at least:

```
DATABASE_URL                   # PostgreSQL connection string
                               #   append ?sslmode=disable for a local non-TLS PG
AUTH_SECRET                    # NextAuth secret
AUTH_URL                       # canonical deployment URL (e.g. https://eat.icarusx.space)

AMAP_WEB_SERVICE_KEY           # Amap web service key (server)
NEXT_PUBLIC_AMAP_JS_KEY        # Amap JS key (baked into the bundle at build time)
NEXT_PUBLIC_AMAP_JS_SECRET     # Amap JS security code

BAIDU_MAP_AK                   # Baidu web service key (server)
NEXT_PUBLIC_BAIDU_MAP_AK       # Baidu JS key (baked at build time)
```

`NEXT_PUBLIC_*` values are compiled into the client bundle at build time, so in
Docker they must be passed as build args (see `docker-compose.yml`).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` | Production build (`output: 'standalone'`) |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |

## Deployment

Built as a standalone Next.js output and run in Docker on a Raspberry Pi 5. The Pi
sits behind an frp tunnel to an Alibaba Cloud ECS box running OpenResty, which
reverse-proxies `eat.icarusx.space`. Deploy with `scripts/deploy.sh` (git pull +
docker build + restart).

## More

Architecture, database schema, route list, coordinate-system handling, and the map
provider / i18n / theme systems are documented in [`CLAUDE.md`](./CLAUDE.md).
