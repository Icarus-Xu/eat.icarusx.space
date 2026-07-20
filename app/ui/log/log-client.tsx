// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { LogRow } from '@/app/lib/log';

function statusColor(code: number | null): string {
  if (code === null) return 'text-muted';
  if (code < 300) return 'text-green-600 dark:text-green-400';
  if (code < 400) return 'text-appetite dark:text-appetite-d';
  if (code < 500) return 'text-star dark:text-star-d';
  return 'text-red-600 dark:text-red-400';
}

function methodColor(method: string | null): string {
  switch (method) {
    case 'GET': return 'text-appetite dark:text-appetite-d';
    case 'POST': return 'text-green-600 dark:text-green-400';
    case 'DELETE': return 'text-red-600 dark:text-red-400';
    case 'GEOLOCATION': return 'text-purple-600 dark:text-purple-400';
    default: return 'text-muted';
  }
}

function typeBadge(type: string): string {
  switch (type) {
    case 'api': return 'bg-appetite-soft text-appetite dark:bg-appetite-soft-d dark:text-appetite-d';
    case 'page': return 'bg-paper text-ink dark:bg-card-d dark:text-sub-d';
    case 'client_error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-paper text-sub';
  }
}

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
  } catch {
    return ts;
  }
}

function shortUa(ua: string | null): string {
  if (!ua) return '-';
  // Show first meaningful segment: browser name
  const match =
    ua.match(/\b(OPR|Edg|Chrome|Firefox|Safari|MSIE|Trident)\b/) ??
    ua.match(/\b(CriOS|FxiOS|GSA)\b/);
  if (match) {
    // Also show iOS/Android/Mac/Windows
    const os = ua.match(/\(([^)]+)\)/)?.[1]?.split(';')[0] ?? '';
    return `${match[1]}${os ? ' / ' + os.slice(0, 20) : ''}`;
  }
  return ua.slice(0, 40);
}

interface Props {
  logs: LogRow[];
  params: { type?: string; path?: string; status?: string; page?: string };
  totalPages: number;
}

export default function LogClient({ logs, params, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = parseInt(params.page ?? '1', 10);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value) {
        sp.set(key, value);
      } else {
        sp.delete(key);
      }
      sp.delete('page');
      router.push(`${pathname}?${sp.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const goPage = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('page', String(p));
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="rounded border border-line dark:border-line-d bg-card dark:bg-card-d text-sm px-2 py-1 transition-colors focus:border-appetite focus:outline-none dark:focus:border-appetite-d"
          value={params.type ?? ''}
          onChange={(e) => updateFilter('type', e.target.value)}
        >
          <option value="">All types</option>
          <option value="api">api</option>
          <option value="page">page</option>
          <option value="client_error">client_error</option>
        </select>
        <input
          type="text"
          placeholder="Path contains..."
          className="rounded border border-line dark:border-line-d bg-card dark:bg-card-d text-sm px-2 py-1 transition-colors focus:border-appetite focus:outline-none dark:focus:border-appetite-d w-44"
          defaultValue={params.path ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateFilter('path', (e.target as HTMLInputElement).value.trim());
          }}
          onBlur={(e) => updateFilter('path', e.target.value.trim())}
        />
        <input
          type="number"
          placeholder="Status"
          className="rounded border border-line dark:border-line-d bg-card dark:bg-card-d text-sm px-2 py-1 transition-colors focus:border-appetite focus:outline-none dark:focus:border-appetite-d w-20"
          defaultValue={params.status ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateFilter('status', (e.target as HTMLInputElement).value.trim());
          }}
          onBlur={(e) => updateFilter('status', e.target.value.trim())}
        />
        <span className="text-xs text-muted ml-auto">{logs.length} rows (last 7 days)</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-line dark:border-line-d">
        <table className="min-w-full text-xs divide-y divide-line dark:divide-line-d">
          <thead className="bg-paper dark:bg-card-d">
            <tr>
              {['Time', 'Type', 'User', 'Method', 'Path', 'Status', 'ms', 'Error', 'UA / IP'].map((h) => (
                <th
                  key={h}
                  className="px-2 py-2 text-left text-xs font-medium text-muted dark:text-muted-d whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card dark:bg-paper-d divide-y divide-line dark:divide-line-d">
            {logs.length === 0 && (
              <tr>
                <td colSpan={9} className="px-2 py-6 text-center text-muted">
                  No logs found.
                </td>
              </tr>
            )}
            {logs.map((row) => (
              <tr key={row.id} className="hover:bg-appetite-soft dark:hover:bg-appetite-soft-d transition-colors">
                <td className="px-2 py-1.5 whitespace-nowrap text-muted dark:text-muted-d">
                  {formatTime(row.created_at)}
                </td>
                <td className="px-2 py-1.5">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeBadge(row.type)}`}>
                    {row.type}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-ink dark:text-sub-d whitespace-nowrap">
                  {row.user_id ?? <span className="text-muted">-</span>}
                </td>
                <td className={`px-2 py-1.5 font-mono font-semibold whitespace-nowrap ${methodColor(row.method)}`}>
                  {row.method ?? '-'}
                </td>
                <td
                  className="px-2 py-1.5 font-mono text-ink dark:text-ink-d max-w-[200px] truncate"
                  title={row.path}
                >
                  {row.path}
                </td>
                <td className={`px-2 py-1.5 font-mono font-semibold whitespace-nowrap ${statusColor(row.status_code)}`}>
                  {row.status_code ?? '-'}
                </td>
                <td className="px-2 py-1.5 text-right text-muted dark:text-muted-d whitespace-nowrap">
                  {row.duration_ms != null ? row.duration_ms : '-'}
                </td>
                <td
                  className="px-2 py-1.5 text-red-600 dark:text-red-400 max-w-[200px] truncate"
                  title={row.error_message ?? undefined}
                >
                  {row.error_message ?? '-'}
                </td>
                <td
                  className="px-2 py-1.5 text-muted dark:text-muted-d max-w-[160px] truncate"
                  title={[row.user_agent, row.ip].filter(Boolean).join(' | ')}
                >
                  {shortUa(row.user_agent)}
                  {row.ip && <span className="ml-1 text-muted dark:text-muted-d">{row.ip}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => goPage(currentPage - 1)}
            className="px-2 py-1 rounded border border-line dark:border-line-d text-sm transition-colors hover:border-appetite disabled:opacity-40 dark:hover:border-appetite-d"
          >
            Prev
          </button>
          <span className="text-sm text-sub dark:text-muted-d">
            Page {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => goPage(currentPage + 1)}
            className="px-2 py-1 rounded border border-line dark:border-line-d text-sm transition-colors hover:border-appetite disabled:opacity-40 dark:hover:border-appetite-d"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
