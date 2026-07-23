// Copyright (C) 2026 Icarus. All rights reserved.
import SideNav from '@/app/ui/dashboard/sidenav';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AppBrand from '@/app/ui/app-brand';
import UserMenu from '@/app/ui/user-menu';
import { LocationProvider } from '@/app/ui/location-context';
import { MapProviderContextProvider } from '@/app/ui/map-provider-context';
import MapProviderModal from '@/app/ui/map-provider-modal';
import PageLogger from '@/app/ui/page-logger';
import ErrorInterceptor from '@/app/ui/error-interceptor';
import { auth, signOut } from '@/auth';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userName = session?.user?.name ?? '';

  return (
    <LocationProvider>
      <MapProviderContextProvider>
        <MapProviderModal />
        <PageLogger />
        <ErrorInterceptor />
        <div className="flex h-dvh flex-col overflow-hidden lg:flex-row">

          {/* Mobile: top header */}
          <header className="flex flex-none items-center justify-between border-b border-line bg-paper px-6 py-5 dark:border-line-d dark:bg-paper-d lg:hidden">
            <AppBrand />
            <UserMenu
              userName={userName}
              signOutAction={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            />
          </header>

          {/* Desktop: sidebar */}
          <div className="hidden w-64 flex-none lg:block">
            <SideNav />
          </div>

          {/* Content */}
          <div className="min-h-0 grow overflow-y-auto px-5 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:p-12 lg:pb-12">
            {children}
          </div>

          {/* Mobile: bottom tab bar */}
          <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] dark:border-line-d dark:bg-paper-d lg:hidden">
            <NavLinks variant="bottom" />
          </nav>

        </div>
      </MapProviderContextProvider>
    </LocationProvider>
  );
}
