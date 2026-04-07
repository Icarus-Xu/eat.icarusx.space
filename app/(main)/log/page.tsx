// Copyright (C) 2026 Icarus. All rights reserved.
import { queryLogs, countLogs, cleanupOldLogs, PAGE_SIZE } from '@/app/lib/log';
import LogClient from '@/app/ui/log/log-client';
import { Suspense } from 'react';

interface PageProps {
  searchParams: Promise<{ type?: string; path?: string; status?: string; page?: string }>;
}

export default async function LogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  await cleanupOldLogs();

  const [logs, total] = await Promise.all([
    queryLogs({ type: params.type, path: params.path, status: params.status, page }),
    countLogs({ type: params.type, path: params.path, status: params.status }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="page-heading">Access Logs</h1>
      <Suspense>
        <LogClient logs={logs} params={{ ...params, page: String(page) }} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
