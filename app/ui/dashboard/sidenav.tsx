// Copyright (C) 2026 Icarus. All rights reserved.
import Link from 'next/link';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
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
        className="mb-2 flex h-20 items-center justify-center p-4 md:h-40"
        href="/home"
      >
        <AppLogo />
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow md:block"></div>
        <div className="flex h-[48px] w-full items-center justify-between rounded-xl border border-line bg-paper p-3 dark:border-line-d dark:bg-card-d md:p-2 md:px-3">
          <span className="hidden items-center gap-2 truncate text-sm font-bold text-ink dark:text-ink-d md:flex">
            <span className="h-6 w-6 shrink-0 rounded-full border border-appetite bg-appetite-soft dark:border-appetite-d dark:bg-appetite-soft-d" />
            <span className="truncate">{userName}</span>
          </span>
          <div className="flex items-center gap-1">
            <Link href="/settings" aria-label="设置" className="icon-btn">
              <Cog6ToothIcon className="w-5" />
            </Link>
            <SignOutButton action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
