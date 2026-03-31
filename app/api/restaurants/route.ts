// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import { fetchAllRestaurants } from '@/app/lib/restaurant-data';

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const restaurants = await fetchAllRestaurants();
    return Response.json(restaurants);
  } catch (e) {
    console.error('[/api/restaurants]', e);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
