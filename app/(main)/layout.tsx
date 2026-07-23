// Copyright (C) 2026 Icarus. All rights reserved.
import SideNav from '@/app/ui/dashboard/sidenav';
import MobileNavigation from '@/app/ui/mobile-navigation';
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

          <MobileNavigation
            userName={userName}
            signOutAction={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          />

          {/* Desktop: sidebar */}
          <div className="hidden w-64 flex-none lg:block">
            <SideNav />
          </div>

          {/* Content */}
          <div className="main-scroll-shell min-h-0 grow overflow-y-auto px-5 pt-6 lg:p-12 lg:pb-12">
            {children}
          </div>

        </div>
      </MapProviderContextProvider>
    </LocationProvider>
  );
}
