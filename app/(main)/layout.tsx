// Copyright (C) 2026 Icarus. All rights reserved.
import Link from 'next/link';
import SideNav from '@/app/ui/dashboard/sidenav';
import SignOutButton from '@/app/ui/sign-out-button';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AppLogo from '@/app/ui/app-logo';
import { LocationProvider } from '@/app/ui/location-context';
import { MapProviderContextProvider } from '@/app/ui/map-provider-context';
import MapProviderModal from '@/app/ui/map-provider-modal';
import { LangProvider } from '@/app/ui/lang-context';
import { auth, signOut } from '@/auth';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name ?? '';

  return (
    <LangProvider>
    <LocationProvider>
      <MapProviderContextProvider>
        <MapProviderModal />
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">

          {/* Mobile: top header */}
          <header className="flex flex-none items-center justify-between border-b bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900 md:hidden">
            <Link href="/home">
              <AppLogo small />
            </Link>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{userName}</span>
            <SignOutButton action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }} />
          </header>

          {/* Desktop: sidebar */}
          <div className="hidden w-64 flex-none md:block">
            <SideNav />
          </div>

          {/* Content */}
          <div className="grow overflow-y-auto p-4 pb-20 md:p-12 md:pb-12">
            {children}
          </div>

          {/* Mobile: bottom tab bar */}
          <nav className="fixed bottom-0 left-0 right-0 flex border-t bg-white dark:border-gray-700 dark:bg-gray-900 md:hidden">
            <NavLinks variant="bottom" />
          </nav>

        </div>
      </MapProviderContextProvider>
    </LocationProvider>
    </LangProvider>
  );
}
