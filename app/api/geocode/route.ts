// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import { geocodeAddress } from '@/app/lib/amap';
import { gcj02ToWgs84 } from '@/app/lib/coords';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address')?.trim();
  if (!address) return Response.json({ error: 'Missing address' }, { status: 400 });

  const coords = await geocodeAddress(address);
  if (!coords) return Response.json({ error: 'Address not found.' }, { status: 422 });

  // Amap returns GCJ-02 coordinates; normalize to WGS-84 for consistent storage
  const wgs84 = gcj02ToWgs84(coords.lat, coords.lng);
  return Response.json(wgs84);
}
