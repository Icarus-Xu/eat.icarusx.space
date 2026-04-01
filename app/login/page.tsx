// Copyright (C) 2026 Icarus. All rights reserved.
import type { Metadata } from 'next';
import AppLogo from '@/app/ui/app-logo';

export const metadata: Metadata = { title: 'Login' };
import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
    return (
        <main className="flex items-center justify-center md:h-screen">
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
                <div className="flex h-20 w-full items-center justify-center rounded-lg bg-amber-50 p-3 md:h-36">
                    <AppLogo />
                </div>
                <Suspense>
                    <LoginForm />
                </Suspense>
            </div>
        </main>
    );
}