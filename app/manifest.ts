// Copyright (C) 2026 Icarus. All rights reserved.
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'What to Eat',
    short_name: 'What to Eat',
    description: 'Save restaurants, view them on a map, and pick what to eat.',
    lang: 'en',
    dir: 'ltr',
    categories: ['food', 'lifestyle', 'utilities'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    theme_color: '#FBF5EC',
    background_color: '#FBF5EC',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'browser'],
    orientation: 'portrait',
    scope: '/',
    start_url: '/recommend',
    shortcuts: [
      {
        name: 'Recommend',
        short_name: 'Recommend',
        description: 'Pick a restaurant to eat at.',
        url: '/recommend',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Add Restaurant',
        short_name: 'Add',
        description: 'Save a restaurant.',
        url: '/add',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Map',
        short_name: 'Map',
        description: 'View saved restaurants on a map.',
        url: '/map',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
