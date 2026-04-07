// Copyright (C) 2026 Icarus. All rights reserved.
import { auth } from '@/auth';
import { insertLog, extractUserId } from '@/app/lib/log';

const ALLOWED_TYPES = new Set(['api', 'page', 'client_error']);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, method, path, statusCode, errorMessage, userAgent } = body;

    if (!type || !ALLOWED_TYPES.has(type) || typeof path !== 'string' || !path) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    let session;
    try { session = await auth(); } catch { session = null; }
    const userId = extractUserId(session?.user?.email);

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null;

    insertLog({
      type: type as 'api' | 'page' | 'client_error',
      userId,
      method: typeof method === 'string' ? method : null,
      path,
      statusCode: typeof statusCode === 'number' ? statusCode : null,
      durationMs: null,
      errorMessage: typeof errorMessage === 'string' ? errorMessage.slice(0, 500) : null,
      userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 300) : null,
      ip,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
}
