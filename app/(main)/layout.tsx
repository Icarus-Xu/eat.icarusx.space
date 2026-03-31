// Copyright (C) 2026 Icarus. All rights reserved.
import SideNav from '@/app/ui/dashboard/sidenav';
import { LocationProvider } from '@/app/ui/location-context';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <div className="w-full flex-none md:w-64">
          <SideNav />
        </div>
        <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
      </div>
    </LocationProvider>
  );
}
