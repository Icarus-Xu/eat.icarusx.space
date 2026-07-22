import '@/app/ui/global.css';
import type { Metadata } from 'next';
import ServiceWorkerRegister from '@/app/ui/service-worker-register';
import { ThemeProvider } from '@/app/ui/theme-context';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#FBF5EC" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#211A15" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
