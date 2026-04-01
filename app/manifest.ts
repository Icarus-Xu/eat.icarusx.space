// Copyright (C) 2026 Icarus. All rights reserved.
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'What to Eat',
    short_name: 'What to Eat',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
    theme_color: '#fffbeb',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/recommend',
  };
}
