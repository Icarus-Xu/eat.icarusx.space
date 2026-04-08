// Copyright (C) 2026 Icarus. All rights reserved.
import postgres from 'postgres';
import { auth } from '@/auth';

const sql = postgres(process.env.DATABASE_URL!, { ssl: process.env.DATABASE_URL?.includes('sslmode=disable') ? false : 'require' });

export interface LogEntry {
  type: 'api' | 'page' | 'client_error';
  userId?: string | null;
  method?: string | null;
  path: string;
  statusCode?: number | null;
  durationMs?: number | null;
  errorMessage?: string | null;
  userAgent?: string | null;
  ip?: string | null;
}

export interface LogRow {
  id: string;
  created_at: string;
  type: string;
  user_id: string | null;
  method: string | null;
  path: string;
  status_code: number | null;
  duration_ms: number | null;
  error_message: string | null;
  user_agent: string | null;
  ip: string | null;
}

function getIp(req: Request): string | null {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null
  );
}

export function extractUserId(email: string | null | undefined): string | null {
  if (!email) return null;
  return email.endsWith('@local') ? email.slice(0, -6) : email;
}

// Fire-and-forget: never awaited, errors are silently swallowed
export function insertLog(entry: LogEntry): void {
  sql`
    INSERT INTO logs
      (type, user_id, method, path, status_code, duration_ms, error_message, user_agent, ip)
    VALUES (
      ${entry.type},
      ${entry.userId ?? null},
      ${entry.method ?? null},
      ${entry.path},
      ${entry.statusCode ?? null},
      ${entry.durationMs ?? null},
      ${entry.errorMessage ?? null},
      ${entry.userAgent ?? null},
      ${entry.ip ?? null}
    )
  `.catch(() => {});
}

// Wraps an API route handler; logs request/response automatically.
// Calls auth() once for userId. Routes that also call auth() benefit from
// NextAuth v5 request-scoped caching (no double round-trip).
export async function logApiRequest(
  path: string,
  req: Request,
  handler: () => Promise<Response>,
): Promise<Response> {
  const start = Date.now();
  const method = req.method;
  const userAgent = req.headers.get('user-agent');
  const ip = getIp(req);

  let session;
  try {
    session = await auth();
  } catch {
    session = null;
  }
  const userId = extractUserId(session?.user?.email);

  let response: Response;
  try {
    response = await handler();
  } catch (e) {
    insertLog({
      type: 'api', userId, method, path,
      statusCode: 500, durationMs: Date.now() - start,
      errorMessage: String(e), userAgent, ip,
    });
    throw e;
  }

  // For non-2xx responses, try to extract the error message from the body
  let errorMessage: string | null = null;
  if (!response.ok) {
    try {
      const data = await response.clone().json();
      errorMessage = typeof data.error === 'string' ? data.error : null;
    } catch { /* ignore */ }
  }

  insertLog({
    type: 'api', userId, method, path,
    statusCode: response.status, durationMs: Date.now() - start,
    errorMessage, userAgent, ip,
  });

  return response;
}

export interface LogQueryParams {
  type?: string;
  path?: string;
  status?: string;
  page?: number;
}

const PAGE_SIZE = 100;

export async function queryLogs(params: LogQueryParams): Promise<LogRow[]> {
  const { type, path, status, page = 1 } = params;
  const offset = (page - 1) * PAGE_SIZE;
  const statusInt = status ? parseInt(status, 10) : NaN;

  const typeFilter = type ? sql`AND type = ${type}` : sql``;
  const pathFilter = path ? sql`AND path ILIKE ${'%' + path + '%'}` : sql``;
  const statusFilter = !isNaN(statusInt) ? sql`AND status_code = ${statusInt}` : sql``;

  return (await sql`
    SELECT
      id::text,
      created_at::text,
      type,
      user_id,
      method,
      path,
      status_code,
      duration_ms,
      error_message,
      user_agent,
      ip
    FROM logs
    WHERE created_at > NOW() - INTERVAL '7 days'
      ${typeFilter}
      ${pathFilter}
      ${statusFilter}
    ORDER BY created_at DESC
    LIMIT ${PAGE_SIZE} OFFSET ${offset}
  `) as LogRow[];
}

export async function countLogs(params: Omit<LogQueryParams, 'page'>): Promise<number> {
  const { type, path, status } = params;
  const statusInt = status ? parseInt(status, 10) : NaN;

  const typeFilter = type ? sql`AND type = ${type}` : sql``;
  const pathFilter = path ? sql`AND path ILIKE ${'%' + path + '%'}` : sql``;
  const statusFilter = !isNaN(statusInt) ? sql`AND status_code = ${statusInt}` : sql``;

  const rows = await sql`
    SELECT COUNT(*)::int AS total
    FROM logs
    WHERE created_at > NOW() - INTERVAL '7 days'
      ${typeFilter}
      ${pathFilter}
      ${statusFilter}
  ` as { total: number }[];

  return rows[0]?.total ?? 0;
}

export { PAGE_SIZE };

export async function cleanupOldLogs(): Promise<void> {
  await sql`DELETE FROM logs WHERE created_at < NOW() - INTERVAL '7 days'`.catch(() => {});
}
