import '@/app/ui/global.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ServiceWorkerRegister from '@/app/ui/service-worker-register';
import { ThemeProvider } from '@/app/ui/theme-context';
import { LangProvider } from '@/app/ui/lang-context';
import type { Lang } from '@/app/lib/i18n';

export const metadata: Metadata = {
  title: {
    template: '%s | What to Eat',
    default: 'What to Eat',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') ?? '';
  const defaultLang: Lang = acceptLanguage.startsWith('zh') ? 'zh' : 'en';

  return (
    <html lang={defaultLang === 'zh' ? 'zh' : 'en'}>
      <head>
        <meta name="theme-color" content="#FBF5EC" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#211A15" media="(prefers-color-scheme: dark)" />
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
