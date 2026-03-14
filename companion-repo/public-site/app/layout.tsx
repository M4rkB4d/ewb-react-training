// app/layout.tsx
import type { Metadata } from 'next';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | EastWest Bank',
    default: 'EastWest Bank — Banking Made Easy',
  },
  description:
    'Personal and business banking services from EastWest Bank. ' +
    'Savings accounts, loans, credit cards, and more.',
  metadataBase: new URL('https://ewbanking.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
