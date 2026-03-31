// Copyright (C) 2026 Icarus. All rights reserved.
import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AppLogo from '@/app/ui/app-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signOut, auth } from '@/auth';

export default async function SideNav() {
  const session = await auth();
  const userName = session?.user?.name ?? '';

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-center justify-center rounded-md border-2 border-amber-400 bg-amber-50 p-4 md:h-40"
        href="/home"
      >
        <AppLogo />
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <div className="flex h-[48px] w-full items-center justify-between rounded-md bg-gray-50 p-3 md:p-2 md:px-3">
          <span className="hidden truncate text-sm font-bold text-gray-700 md:block">{userName}</span>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button className="rounded-md p-1 text-gray-500 hover:bg-sky-100 hover:text-blue-600">
              <PowerIcon className="w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
