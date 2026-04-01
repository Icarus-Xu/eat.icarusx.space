// Copyright (C) 2026 Icarus. All rights reserved.
import type { Metadata } from 'next';
import MapPageClient from '@/app/ui/map/map-page-client';

export const metadata: Metadata = { title: 'Map' };

export default function MapPage() {
  return <MapPageClient />;
}
