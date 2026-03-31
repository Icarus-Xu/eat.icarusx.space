// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import { parseAmapUrl } from '@/app/lib/amap';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('url')?.trim();
  if (!raw) return Response.json({ error: 'Missing url parameter' }, { status: 400 });

  // Extract first URL from the pasted text (user may paste full share text)
  const urlMatch = raw.match(/https?:\/\/\S+/);
  const url = urlMatch ? urlMatch[0] : raw;

  let poi;
  try {
    poi = await parseAmapUrl(url);
  } catch (e) {
    console.error('[parse-restaurant] error:', e);
    return Response.json({ error: 'Failed to fetch link. Please check your network and try again.' }, { status: 500 });
  }
  if (!poi) {
    return Response.json({ error: 'Could not parse restaurant from this link. Please use an Amap share link.' }, { status: 422 });
  }

  return Response.json({ poi });
}
