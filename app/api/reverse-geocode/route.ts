// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import { reverseGeocode as amapReverseGeocode } from '@/app/lib/amap';
import { reverseGeocode as baiduReverseGeocode } from '@/app/lib/baidu';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  const provider = searchParams.get('provider') ?? 'amap';

  if (isNaN(lat) || isNaN(lng)) {
    return Response.json({ error: 'Missing lat/lng' }, { status: 400 });
  }

  const address = provider === 'baidu'
    ? await baiduReverseGeocode(lat, lng)
    : await amapReverseGeocode(lat, lng);

  if (!address) return Response.json({ error: 'Reverse geocode failed.' }, { status: 422 });

  return Response.json({ address });
}
