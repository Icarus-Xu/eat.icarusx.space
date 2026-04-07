# Project: Restaurant Recommendation App

A personal web app for two users to record and pick restaurants together.

## Copyright

New source files must use: `Copyright (C) <current_year> Icarus. All rights reserved.`
(Overrides the global Viture Inc. default for this personal project.)

## Tech Stack

- Framework: Next.js 16 (App Router), React, TypeScript
- Database: PostgreSQL via Neon serverless, raw SQL using `postgres` library
- Auth: NextAuth.js v5 beta (5.0.0-beta.30), Credentials provider
- Styling: Tailwind CSS, Heroicons
- Validation: Zod
- Package manager: pnpm
- Deployment: Vercel (automatic deploy on push to main)

## Environment Variables

```
DATABASE_URL                   Neon PostgreSQL connection string (via postgres library)
AUTH_SECRET                    NextAuth secret
AUTH_URL                       Full URL of the deployment (e.g. https://eat.icarusx.space)
AMAP_WEB_SERVICE_KEY           Amap Web Service API key (server-side)
NEXT_PUBLIC_AMAP_JS_KEY        Amap JS API key (frontend)
NEXT_PUBLIC_AMAP_JS_SECRET     Amap JS API security code (frontend)
BAIDU_MAP_AK                   Baidu Maps Web Service API key (server-side)
NEXT_PUBLIC_BAIDU_MAP_AK       Baidu Maps JS API key (frontend)
ALLOWED_DEV_ORIGINS            Comma-separated IPs allowed for cross-origin dev access
```

## Database Schema

Run `GET /migrate` once to create tables.

```
users          (id, name, email, password)
restaurants    (id, name, address, lat, lng, amap_poi_id, source_url,
                baidu_poi_id, baidu_source_url, added_by, created_at)
visits         (id, restaurant_id, user_id, rating 0-5, notes, visited_at, created_at)
```

Two users share the same restaurant pool. Each user has their own visit records.
A restaurant is considered "visited" if any user has a visit record for it.
A restaurant is "good" if max rating across all users >= 3.
Both `amap_poi_id` and `baidu_poi_id` are optional; at least one must be present when saving.

## Route Structure

```
/                    Redirects logged-in users to /recommend, others to /login
/login               Login page (NextAuth Credentials, auto-login from localStorage)
/home                Home page (placeholder)
/recommend           Recommendation page (default landing after login)
/add                 Add restaurant page (search by name or paste share link)
/map                 Map view page (Amap or Baidu JS SDK based on provider)
/settings            Settings page (map provider + language selection)
/api/recommend            GET ?lat=&lng=&radius= -- returns up to 3 restaurant cards
/api/restaurants          GET/POST/DELETE -- restaurants CRUD
/api/save-restaurant      POST -- upsert restaurant + optional visit record
/api/parse-restaurant     POST -- parse Amap or Baidu share link to POI info
/api/search-restaurant    GET ?q=&lat=&lng=&provider= -- search by name (Amap or Baidu)
/api/geocode              GET ?address= -- address to WGS-84 coordinates (normalised from GCJ-02)
/api/reverse-geocode      GET ?lat=&lng=&provider= -- coordinates to address
/api/cross-search         POST -- find same POI on the other map provider
/migrate                  GET -- creates/alters tables (run once)
```

All routes under /home, /recommend, /add, /map, /settings require authentication.

## Recommendation Logic (`/api/recommend`)

- Input: device GPS coordinates (lat, lng), optional radius (default 3000 m)
- Filter: restaurants within radius (Haversine distance)
- Selection:
  - 1 good-rated visited restaurant (max_rating >= 3)
  - 2 unvisited bookmarked restaurants
  - If slots cannot be filled, randomly pick from remaining pool
  - Bad-rated visited restaurants (rating < 3) are excluded unless no other
    visited restaurants exist at all
- Returns: RestaurantCard[] with name, address, distanceM, visited, rating,
  notes, lastVisitedAt, amapPoiId, baiduPoiId

## Key Files

```
app/(main)/layout.tsx                  Shared layout: LangProvider > LocationProvider >
                                       MapProviderContextProvider; top header + sidebar
app/(main)/home/page.tsx               Home page
app/(main)/recommend/page.tsx          Recommendation page (server)
app/(main)/add/page.tsx                Add restaurant page
app/(main)/map/page.tsx                Map view page
app/(main)/settings/page.tsx           Settings: map provider, language, theme toggle

app/ui/dashboard/sidenav.tsx           Desktop sidebar with nav + sign-out
app/ui/dashboard/nav-links.tsx         Nav links (sidebar + bottom tab bar); uses useT()
app/ui/sign-out-button.tsx             Clears localStorage keys + resets theme context to auto
app/ui/recommend/recommend-client.tsx  Client: fetch recommendations, radius selector, refresh
app/ui/recommend/restaurant-card.tsx   Card: name, distance, rating, notes; links to provider map
app/ui/add/add-page-client.tsx         Add page client: refreshKey state
app/ui/add/collect-form.tsx            Restaurant form: search by name tab + paste link tab;
                                       triggers cross-search after POI selection
app/ui/add/restaurant-list.tsx         Restaurant list with distances; cards link to provider map
app/ui/add/star-input.tsx              Star rating input (0-5)
app/ui/location-input.tsx              Location input: locate button (GPS) + address search
app/ui/map-view.tsx                    Interactive map (Amap JS SDK, WGS-84 -> GCJ-02)
app/ui/baidu-map-view.tsx              Interactive map (Baidu Maps GL, WGS-84 -> BD-09)
app/ui/map/map-page-client.tsx         Switches between MapView and BaiduMapView by provider
app/ui/location-context.tsx            Location context: reads/writes localStorage lastLocation;
                                       auto-GPS only when no cached location; exposes locate()
app/ui/map-provider-context.tsx        Map provider context (amap | baidu); localStorage mapProvider
app/ui/map-provider-modal.tsx          First-run modal to choose map provider
app/ui/cross-search-modal.tsx          Modal: select matching POI on the other provider (0/many results)
app/ui/lang-context.tsx                Language context (en | zh); localStorage lang;
                                       auto-detects from navigator.language on first visit
app/ui/theme-context.tsx               Theme context (auto | light | dark); localStorage theme;
                                       auto follows matchMedia when no saved preference;
                                       auto listens for system changes via matchMedia event
app/ui/login-form.tsx                  Login form with localStorage auto-login

app/api/recommend/route.ts             Recommendation API
app/api/restaurants/route.ts           Restaurants CRUD API
app/api/save-restaurant/route.ts       Save restaurant + visit; accepts amapPoiId + baiduPoiId
app/api/parse-restaurant/route.ts      Parse Amap or Baidu share link; returns { poi, provider }
app/api/search-restaurant/route.ts     Search by name; provider param selects Amap or Baidu
app/api/geocode/route.ts               Geocode API; normalises Amap GCJ-02 output to WGS-84
app/api/reverse-geocode/route.ts       Reverse geocode; provider param selects Amap or Baidu
app/api/cross-search/route.ts          Cross-provider POI search (Amap <-> Baidu)

app/lib/amap.ts                        Amap API: URL parsing, POI lookup, name search, Haversine
app/lib/baidu.ts                       Baidu API: Suggestion search, POI detail, reverse geocode,
                                       short link parsing (j.map.baidu.com)
app/lib/coords.ts                      Coordinate conversions: WGS-84 <-> GCJ-02 <-> BD-09
app/lib/i18n.ts                        Translation strings for en and zh
app/lib/restaurant-data.ts             Restaurant data helpers (RestaurantRow type, SQL queries)
app/lib/action.ts                      Server actions (authenticate)
app/migrate/route.ts                   DB migration endpoint
auth.config.ts                         Auth middleware: protects /home /recommend /add /map /settings
auth.ts                                NextAuth config with Credentials provider
```

## Coordinate System Notes

All coordinates stored in the DB and held in LocationContext are **WGS-84** (GPS standard).

- `/api/geocode` normalises Amap's GCJ-02 output to WGS-84 before returning
- Map components convert on the fly: `wgs84ToGcj02` (Amap), `wgs84ToBd09` (Baidu)
- Cross-search converts between providers using `bd09ToGcj02` / `gcj02ToWgs84` as needed

## Map Provider System

- First visit: `MapProviderModal` prompts user to choose Amap or Baidu
- Stored in `localStorage.mapProvider`; cleared on sign-out (re-prompts next session)
- Affects: restaurant search, navigation links, reverse geocode, map JS SDK on /map

## Localisation (i18n)

- Languages: `en` (English) and `zh` (Chinese)
- Stored in `localStorage.lang`; auto-detected from `navigator.language` on first visit
- Cleared on sign-out (re-detected next session)
- Toggle in Settings page; all UI strings come from `useT()` hook (`lang-context.tsx`)

## Theme System

- Settings: `auto` (default) | `light` | `dark`
- `auto` is stored as absent key; `light`/`dark` stored as `localStorage.theme`
- `auto` follows system preference via `matchMedia('(prefers-color-scheme: dark)')` and
  listens for OS-level changes; explicit `light`/`dark` ignores system preference
- Applies `dark` class to `<html>` via `ThemeProvider` (`theme-context.tsx`) in root layout
- Tailwind `darkMode: 'class'` is enabled
- Cleared on sign-out (reverts to auto, re-follows system next session)
- `body` has `transition: background-color 0.3s, color 0.3s` for smooth switching

## Amap Integration

Server-side uses `AMAP_WEB_SERVICE_KEY` to call:
- `GET /v3/place/detail?id=POI_ID` -- fetch POI name, address, coordinates
- `GET /v3/geocode/regeo` -- reverse geocode (returns GCJ-02, normalised to WGS-84)
- `GET /v3/place/text` -- name search (types=050000 restaurants, offset=10)

Supported URL formats for parsing (paste link mode):
- `https://surl.amap.com/XXXXX` (short link, follows redirect)
- `https://www.amap.com/detail/POIID`
- `https://uri.amap.com/poi?id=POIID`

source_url stored as `https://ditu.amap.com/place/{amap_poi_id}` (constructed server-side).

## Baidu Maps Integration

Server-side uses `BAIDU_MAP_AK` to call:
- `GET /place/v2/suggestion` -- name search (Suggestion API; same source as Baidu web)
- `GET /place/v2/detail?uid=UID` -- fetch POI detail
- `GET /reverse_geocoding/v3/` -- reverse geocode (accepts WGS-84 via coordtype=wgs84ll)

Short link parsing: `https://j.map.baidu.com/...` -- follows redirect, extracts uid from Location header.
baidu_source_url stored as `https://map.baidu.com/?uid={baidu_poi_id}` (constructed server-side).

Frontend uses `NEXT_PUBLIC_BAIDU_MAP_AK` with Baidu Maps GL (BMapGL) loaded via script tag
with `callback=` URL parameter pattern for initialization sequencing.

## Auth Notes

- Login: user enters an ID; system creates or retrieves user by `${id}@local` email
- Auto-login: saved userId in localStorage, cleared on sign-out via SignOutButton
- `AUTH_URL` must be set to the canonical deployment URL for NextAuth callbacks
- localStorage keys cleared on sign-out: `user_id`, `mapProvider`, `lang`, `theme`, `lastLocation`
