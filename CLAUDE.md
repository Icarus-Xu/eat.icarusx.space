# Project: Restaurant Recommendation App

A personal web app for two users to record and pick restaurants together.

## Copyright

New source files must use: `Copyright (C) <current_year> Icarus. All rights reserved.`
(Overrides the global Viture Inc. default for this personal project.)

## Tech Stack

- Framework: Next.js 15 (App Router), React, TypeScript
- Database: PostgreSQL via Neon serverless, raw SQL using `@netlify/neon` library
- Auth: NextAuth.js v5 beta (5.0.0-beta.30), Credentials provider
- Styling: Tailwind CSS, Heroicons
- Validation: Zod
- Package manager: pnpm
- Deployment: Netlify (automatic deploy on push to main)

## Environment Variables

```
NETLIFY_DATABASE_URL           Neon PostgreSQL connection string (via @netlify/neon)
AUTH_SECRET                    NextAuth secret
AUTH_URL                       Full URL of the deployment (e.g. https://eat.icarusx.space)
AMAP_WEB_SERVICE_KEY           Amap Web Service API key (server-side)
NEXT_PUBLIC_AMAP_JS_KEY        Amap JS API key (frontend)
NEXT_PUBLIC_AMAP_JS_SECRET     Amap JS API security code (frontend)
```

## Database Schema

Run `GET /migrate` once to create tables.

```
users          (id, name, email, password)
restaurants    (id, name, address, lat, lng, amap_poi_id, source_url, added_by, created_at)
visits         (id, restaurant_id, user_id, rating 0-5, notes, visited_at, created_at)
```

Two users share the same restaurant pool. Each user has their own visit records.
A restaurant is considered "visited" if any user has a visit record for it.
A restaurant is "good" if max rating across all users >= 3.

## Route Structure

```
/                    Redirects logged-in users to /recommend, others to /login
/login               Login page (NextAuth Credentials, auto-login from localStorage)
/home                Home page (placeholder)
/recommend           Recommendation page (default landing after login)
/add                 Add restaurant page (parse Amap URL, manual input)
/map                 Map view page
/api/recommend       GET ?lat=&lng= -- returns up to 3 restaurant cards
/api/restaurants     GET/POST/DELETE -- restaurants CRUD
/api/save-restaurant POST -- upsert restaurant + optional visit record
/api/parse-restaurant POST -- parse Amap URL to POI info
/api/geocode         GET ?address= -- address to coordinates
/api/reverse-geocode GET ?lat=&lng= -- coordinates to address
/migrate             GET -- creates tables (run once)
```

All routes under /home, /recommend, /add, /map require authentication.

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
  notes, lastVisitedAt

## Key Files

```
app/(main)/layout.tsx                  Shared layout: top header (mobile) + sidebar (desktop)
app/(main)/home/page.tsx               Home page
app/(main)/recommend/page.tsx          Recommendation page (server)
app/(main)/add/page.tsx                Add restaurant page
app/(main)/map/page.tsx                Map view page
app/ui/dashboard/sidenav.tsx           Desktop sidebar with nav + sign-out
app/ui/dashboard/nav-links.tsx         Nav links (sidebar variant + bottom tab bar variant)
app/ui/sign-out-button.tsx             Client component: clears localStorage then signs out
app/ui/recommend/recommend-client.tsx  Client: geolocation, fetch, refresh
app/ui/recommend/restaurant-card.tsx   Card: name, distance, rating, notes
app/ui/add/add-page-client.tsx         Add page client logic
app/ui/add/collect-form.tsx            Restaurant form (URL parse + manual input)
app/ui/add/restaurant-list.tsx         Restaurant list with edit/delete
app/ui/add/star-input.tsx              Star rating input (0-5)
app/ui/location-input.tsx              Location input with Amap autocomplete
app/ui/map-view.tsx                    Interactive map (Amap JS SDK)
app/ui/location-context.tsx            React context: shared GPS location state
app/ui/login-form.tsx                  Login form with localStorage auto-login
app/api/recommend/route.ts             Recommendation API
app/api/restaurants/route.ts           Restaurants CRUD API
app/api/save-restaurant/route.ts       Save restaurant + visit API
app/api/parse-restaurant/route.ts      Parse Amap URL API
app/api/geocode/route.ts               Geocode API
app/api/reverse-geocode/route.ts       Reverse geocode API
app/lib/amap.ts                        Amap URL parsing, POI lookup, Haversine distance
app/lib/restaurant-data.ts             Restaurant data helpers
app/lib/action.ts                      Server actions (authenticate)
app/migrate/route.ts                   DB migration endpoint
auth.config.ts                         Auth middleware: protects /home /recommend /add /map
auth.ts                                NextAuth config with Credentials provider
```

## Amap Integration

Server-side uses `AMAP_WEB_SERVICE_KEY` to call:
- `GET /v3/place/detail?id=POI_ID` -- fetch POI name, address, coordinates
- `GET /v3/geocode/regeo` -- reverse geocode (coordinates to address)
- `GET /v3/place/text` -- text search / autocomplete

Supported URL formats for parsing:
- `https://surl.amap.com/XXXXX` (short link, follows redirect)
- `https://www.amap.com/detail/POIID`
- `https://uri.amap.com/poi?id=POIID`

## Auth Notes

- Login: user enters an ID; system creates or retrieves user by `${id}@local` email
- Auto-login: saved userId in localStorage, cleared on sign-out via SignOutButton
- `trustHost: true` required in auth.config.ts for Netlify deployment
- `AUTH_URL` must be set to the canonical deployment URL for NextAuth callbacks
