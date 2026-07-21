// Copyright (C) 2026 Icarus. All rights reserved.
import type { Metadata } from 'next';
import AppLogo from '@/app/ui/app-logo';

export const metadata: Metadata = { title: 'Login' };
import LoginForm from '@/app/ui/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-paper px-4 dark:bg-paper-d">
            <div className="w-full max-w-[380px]">
                <div className="mb-6 flex flex-col items-center gap-3">
                    <AppLogo />
                    <p className="text-sm font-medium tracking-wide text-muted dark:text-muted-d">What to Eat</p>
                </div>
                <Suspense>
                    <LoginForm />
                </Suspense>
            </div>
        </main>
    );
}