'use client';

import { lusitana } from '@/app/ui/fonts';
import { ExclamationCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { authenticate } from '@/app/lib/action';
import { useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'user_id';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/recommend';
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const [userId, setUserId] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-login with saved ID on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    setUserId(saved);
    const fd = new FormData();
    fd.set('userId', saved);
    fd.set('redirectTo', callbackUrl);
    // startTransition is required in React 19 for server actions to handle redirects
    startTransition(async () => {
      await authenticate(undefined, fd);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (userId.trim()) {
      localStorage.setItem(STORAGE_KEY, userId.trim());
    }
  };

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8 dark:bg-gray-800">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Enter your ID to continue.
        </h1>
        <div className="w-full">
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900 dark:text-gray-100"
            htmlFor="userId"
          >
            ID
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 bg-white py-[9px] pl-10 text-sm text-gray-900 outline-2 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
              id="userId"
              type="text"
              name="userId"
              placeholder="Enter your ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              autoComplete="off"
            />
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900 dark:text-gray-400 dark:peer-focus:text-gray-100" />
          </div>
        </div>
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
