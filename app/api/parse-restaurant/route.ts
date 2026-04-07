// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import { parseAmapUrl } from '@/app/lib/amap';
import { parseBaiduShortLink } from '@/app/lib/baidu';
import type { AmapPoi } from '@/app/lib/amap';
import { logApiRequest } from '@/app/lib/log';

function isBaiduUrl(url: string): boolean {
  return url.includes('map.baidu.com') || url.includes('j.map.baidu.com');
}

export async function GET(request: Request) {
  return logApiRequest('/api/parse-restaurant', request, async () => {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('url')?.trim();
  if (!raw) return Response.json({ error: 'Missing url parameter' }, { status: 400 });

  const urlMatch = raw.match(/https?:\/\/\S+/);
  const url = urlMatch ? urlMatch[0] : raw;

  if (isBaiduUrl(url)) {
    let baiduPoi;
    try {
      baiduPoi = await parseBaiduShortLink(url);
    } catch (e) {
      console.error('[parse-restaurant] baidu error:', e);
      return Response.json({ error: 'Failed to fetch Baidu link.' }, { status: 500 });
    }
    if (!baiduPoi) {
      return Response.json({ error: 'Could not parse restaurant from this Baidu link.' }, { status: 422 });
    }
    // Map BaiduPoi to AmapPoi shape using uid as id
    const poi: AmapPoi = {
      id: baiduPoi.uid,
      name: baiduPoi.name,
      address: baiduPoi.address,
      lat: baiduPoi.lat,
      lng: baiduPoi.lng,
    };
    return Response.json({ poi, provider: 'baidu' });
  }

  let poi;
  try {
    poi = await parseAmapUrl(url);
  } catch (e) {
    console.error('[parse-restaurant] amap error:', e);
    return Response.json({ error: 'Failed to fetch link. Please check your network and try again.' }, { status: 500 });
  }
  if (!poi) {
    return Response.json({ error: 'Could not parse restaurant from this link. Please use an Amap or Baidu Maps share link.' }, { status: 422 });
  }
  return Response.json({ poi, provider: 'amap' });
  }); // logApiRequest
}
