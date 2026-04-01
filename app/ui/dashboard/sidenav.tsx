// Copyright (C) 2026 Icarus. All rights reserved.
import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AppLogo from '@/app/ui/app-logo';
import { signOut, auth } from '@/auth';
import SignOutButton from '@/app/ui/sign-out-button';

export default async function SideNav() {
  const session = await auth();
  const userName = session?.user?.name ?? '';

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-center justify-center rounded-md border-2 border-amber-400 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950 md:h-40"
        href="/home"
      >
        <AppLogo />
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-gray-800 md:block"></div>
        <div className="flex h-[48px] w-full items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-800 md:p-2 md:px-3">
          <span className="hidden truncate text-sm font-bold text-gray-700 dark:text-gray-200 md:block">{userName}</span>
          <SignOutButton action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }} />
        </div>
      </div>
    </div>
  );
}
