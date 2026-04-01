import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import type { Metadata } from 'next';
import ServiceWorkerRegister from '@/app/ui/service-worker-register';

export const metadata: Metadata = {
  title: {
    template: '%s | What to Eat',
    default: 'What to Eat',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
      <body className={inter.className}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
