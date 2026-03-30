# Project: Restaurant Recommendation App

A personal web app for two users to record and pick restaurants together.

## Tech Stack

- Framework: Next.js 15 (App Router), React, TypeScript
- Database: PostgreSQL via Neon serverless, raw SQL using `postgres` library
- Auth: NextAuth.js v5 beta, Credentials provider + bcrypt
- Styling: Tailwind CSS, Heroicons
- Validation: Zod
- Package manager: pnpm

## Environment Variables

```
POSTGRES_URL                   Neon PostgreSQL connection string
AUTH_SECRET                    NextAuth secret
AMAP_WEB_SERVICE_KEY           Amap Web Service API key (server-side)
NEXT_PUBLIC_AMAP_JS_KEY        Amap JS API key (frontend)
NEXT_PUBLIC_AMAP_JS_SECRET     Amap JS API security code (frontend)
```

## Database Schema

Run `GET /migrate` once to create tables.

```
users          (id, name, email, password)          -- seeded via /seed
restaurants    (id, name, address, lat, lng, amap_poi_id, source_url, added_by, created_at)
visits         (id, restaurant_id, user_id, rating 0-5, notes, visited_at, created_at)
```

Two users share the same restaurant pool. Each user has their own visit records.
A restaurant is considered "visited" if any user has a visit record for it.
A restaurant is "good" if max rating across all users >= 3.

## Route Structure

```
/                  Redirects logged-in users to /recommend
/login             Login page (NextAuth Credentials)
/recommend         Recommendation page (default landing after login)
/collect           Collection page (placeholder)
/api/recommend     GET ?lat=&lng= -- returns up to 3 restaurant cards
/migrate           GET -- creates restaurants and visits tables (run once)
/dashboard/*       Original tutorial pages (kept, not part of main app)
```

All routes under /recommend and /collect require authentication.

## Recommendation Logic (`/api/recommend`)

- Input: device GPS coordinates (lat, lng)
- Filter: restaurants within 3 km (Haversine distance)
- Selection:
  - 1 good-rated visited restaurant (max_rating >= 3)
  - 2 unvisited bookmarked restaurants
  - If slots cannot be filled, randomly pick from remaining pool
  - Bad-rated visited restaurants (rating < 3) are excluded unless no other
    visited restaurants exist at all
- Returns: RestaurantCard[] with name, address, distanceM, visited, rating,
  notes (first 20 chars), lastVisitedAt

## Key Files

```
app/(main)/layout.tsx                  Shared layout with top nav
app/(main)/recommend/page.tsx          Recommendation page (server)
app/(main)/collect/page.tsx            Collection page placeholder
app/ui/main-nav.tsx                    Top nav (Recommend / Collect tabs)
app/ui/recommend/recommend-client.tsx  Client: geolocation, fetch, refresh
app/ui/recommend/restaurant-card.tsx   Card: name, distance, rating, notes
app/api/recommend/route.ts             Recommendation API endpoint
app/lib/amap.ts                        Amap URL parsing, POI lookup, Haversine
app/migrate/route.ts                   DB migration endpoint
auth.config.ts                         Auth middleware: protects /recommend /collect
```

## Amap Integration

Server-side uses `AMAP_WEB_SERVICE_KEY` to call:
- `GET /v3/place/detail?id=POI_ID` -- fetch POI name, address, coordinates

Supported URL formats for parsing:
- `https://surl.amap.com/XXXXX` (short link, follows redirect)
- `https://www.amap.com/detail/POIID`
- `https://uri.amap.com/poi?id=POIID`
