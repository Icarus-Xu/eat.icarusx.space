import '@/app/ui/global.css';
import type { Metadata, Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import ServiceWorkerRegister from '@/app/ui/service-worker-register';
import { ThemeProvider } from '@/app/ui/theme-context';
import { LangProvider } from '@/app/ui/lang-context';
import type { Lang } from '@/app/lib/i18n';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  applicationName: 'What to Eat',
  description: 'Save restaurants, view them on a map, and pick what to eat.',
  manifest: '/manifest.webmanifest',
  title: {
    template: '%s | What to Eat',
    default: 'What to Eat',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'What to Eat',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const cookieStore = await cookies();
  const savedLang = cookieStore.get('lang')?.value;
  const acceptLanguage = headersList.get('accept-language') ?? '';
  const defaultLang: Lang =
    savedLang === 'en' || savedLang === 'zh' ? savedLang
    : acceptLanguage.startsWith('zh') ? 'zh'
    : 'en';

  return (
    <html lang={defaultLang === 'zh' ? 'zh' : 'en'}>
      <head>
        <meta name="theme-color" content="#FBF5EC" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#211A15" media="(prefers-color-scheme: dark)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="What to Eat" />
      </head>
      <body>
        <ThemeProvider>
          <LangProvider defaultLang={defaultLang}>
            {children}
          </LangProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
