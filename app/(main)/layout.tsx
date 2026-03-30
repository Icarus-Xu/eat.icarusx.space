// Copyright (C) 2026 Viture Inc. All rights reserved.
import MainNav from '@/app/ui/main-nav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <MainNav />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-lg">{children}</div>
      </main>
    </div>
  );
}
