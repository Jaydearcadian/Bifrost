import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bifrost',
  description: 'Canary-first execution safety for TON swaps',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bifrost-bg text-slate-100 antialiased">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
