// Copyright (C) 2026 Icarus. All rights reserved.
'use client';

import { useEffect } from 'react';

// Extracts a short browser/OS label from a User-Agent string.
// Not needed here but kept for potential future use.

function reportClientLog(payload: {
  type: 'client_error';
  method: string;
  path: string;
  statusCode?: number;
  errorMessage?: string;
}, originalFetch: typeof window.fetch) {
  originalFetch('/api/client-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, userAgent: navigator.userAgent }),
  }).catch(() => {});
}

export default function ErrorInterceptor() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    // Patch window.fetch to intercept non-2xx responses
    window.fetch = async function patchedFetch(...args: Parameters<typeof fetch>) {
      let response: Response;
      const input = args[0];
      const init = args[1];

      const rawUrl =
        typeof input === 'string' ? input
        : input instanceof URL ? input.toString()
        : (input as Request).url;

      // Resolve relative URLs to get just the pathname
      let path = rawUrl;
      try {
        path = new URL(rawUrl, window.location.origin).pathname;
      } catch { /* ignore */ }

      // Never report the logging endpoint itself
      if (path === '/api/client-log') {
        return originalFetch(...args);
      }

      const method =
        typeof init?.method === 'string' ? init.method.toUpperCase()
        : input instanceof Request ? input.method
        : 'GET';

      try {
        response = await originalFetch(...args);
      } catch (networkErr) {
        reportClientLog({
          type: 'client_error',
          method,
          path,
          errorMessage: `NetworkError: ${String(networkErr)}`,
        }, originalFetch);
        throw networkErr;
      }

      if (!response.ok) {
        let errorMessage: string | undefined;
        try {
          const data = await response.clone().json();
          errorMessage = typeof data.error === 'string' ? data.error : undefined;
        } catch { /* ignore */ }

        reportClientLog({
          type: 'client_error',
          method,
          path,
          statusCode: response.status,
          errorMessage,
        }, originalFetch);
      }

      return response;
    };

    // Patch navigator.geolocation.getCurrentPosition to capture errors
    if (navigator.geolocation) {
      const originalGetCurrentPosition =
        navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);

      navigator.geolocation.getCurrentPosition = (
        successCallback: PositionCallback,
        errorCallback?: PositionErrorCallback | null,
        options?: PositionOptions,
      ) => {
        originalGetCurrentPosition(
          successCallback,
          (err: GeolocationPositionError) => {
            reportClientLog({
              type: 'client_error',
              method: 'GEOLOCATION',
              path: '/geolocation/getCurrentPosition',
              statusCode: err.code,
              errorMessage: `GeolocationError code=${err.code}: ${err.message}`,
            }, originalFetch);
            if (errorCallback) errorCallback(err);
          },
          options,
        );
      };
    }

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
