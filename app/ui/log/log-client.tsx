// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { LogRow } from '@/app/lib/log';

function statusColor(code: number | null): string {
  if (code === null) return 'text-gray-400';
  if (code < 300) return 'text-green-600 dark:text-green-400';
  if (code < 400) return 'text-blue-600 dark:text-blue-400';
  if (code < 500) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function methodColor(method: string | null): string {
  switch (method) {
    case 'GET': return 'text-blue-600 dark:text-blue-400';
    case 'POST': return 'text-green-600 dark:text-green-400';
    case 'DELETE': return 'text-red-600 dark:text-red-400';
    case 'GEOLOCATION': return 'text-purple-600 dark:text-purple-400';
    default: return 'text-gray-500';
  }
}

function typeBadge(type: string): string {
  switch (type) {
    case 'api': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'page': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    case 'client_error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-600';
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
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
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
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1 w-44"
          defaultValue={params.path ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateFilter('path', (e.target as HTMLInputElement).value.trim());
          }}
          onBlur={(e) => updateFilter('path', e.target.value.trim())}
        />
        <input
          type="number"
          placeholder="Status"
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1 w-20"
          defaultValue={params.status ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateFilter('status', (e.target as HTMLInputElement).value.trim());
          }}
          onBlur={(e) => updateFilter('status', e.target.value.trim())}
        />
        <span className="text-xs text-gray-400 ml-auto">{logs.length} rows (last 7 days)</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-xs divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {['Time', 'Type', 'User', 'Method', 'Path', 'Status', 'ms', 'Error', 'UA / IP'].map((h) => (
                <th
                  key={h}
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {logs.length === 0 && (
              <tr>
                <td colSpan={9} className="px-2 py-6 text-center text-gray-400">
                  No logs found.
                </td>
              </tr>
            )}
            {logs.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-2 py-1.5 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {formatTime(row.created_at)}
                </td>
                <td className="px-2 py-1.5">
                  <span className={`inline-block rounded px-1 py-0.5 text-xs font-medium ${typeBadge(row.type)}`}>
                    {row.type}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {row.user_id ?? <span className="text-gray-400">-</span>}
                </td>
                <td className={`px-2 py-1.5 font-mono font-semibold whitespace-nowrap ${methodColor(row.method)}`}>
                  {row.method ?? '-'}
                </td>
                <td
                  className="px-2 py-1.5 font-mono text-gray-800 dark:text-gray-200 max-w-[200px] truncate"
                  title={row.path}
                >
                  {row.path}
                </td>
                <td className={`px-2 py-1.5 font-mono font-semibold whitespace-nowrap ${statusColor(row.status_code)}`}>
                  {row.status_code ?? '-'}
                </td>
                <td className="px-2 py-1.5 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {row.duration_ms != null ? row.duration_ms : '-'}
                </td>
                <td
                  className="px-2 py-1.5 text-red-600 dark:text-red-400 max-w-[200px] truncate"
                  title={row.error_message ?? undefined}
                >
                  {row.error_message ?? '-'}
                </td>
                <td
                  className="px-2 py-1.5 text-gray-400 dark:text-gray-500 max-w-[160px] truncate"
                  title={[row.user_agent, row.ip].filter(Boolean).join(' | ')}
                >
                  {shortUa(row.user_agent)}
                  {row.ip && <span className="ml-1 text-gray-300 dark:text-gray-600">{row.ip}</span>}
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
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => goPage(currentPage + 1)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
