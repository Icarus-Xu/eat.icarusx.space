// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import { reverseGeocode } from '@/app/lib/amap';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  if (isNaN(lat) || isNaN(lng)) {
    return Response.json({ error: 'Missing lat/lng' }, { status: 400 });
  }

  const address = await reverseGeocode(lat, lng);
  if (!address) return Response.json({ error: 'Reverse geocode failed.' }, { status: 422 });

  return Response.json({ address });
}
