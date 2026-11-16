// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'JANAWAAZ – Har Gaon Ki Awaaz, Har Insaan Ka Haq',
  description: 'AI‑Powered Rural Grievance Redressal & Village Development Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-background min-h-screen text-text">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto">
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </main>
        </div>
      </body>
    </html>
  );
}
