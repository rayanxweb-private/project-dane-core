import React from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { GlobalErrorBoundary } from '@/components/ui/error-boundary';
import '@/app/globals.css';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'DANA Enterprise Payment Platform Dashboard Core Engine',
  description: 'Production-Grade High-Throughput Financial Payment Gateway Framework Integration Interface Client',
  robots: { index: false, follow: false } // Strict corporate node indexing concealment protection enforcement
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased font-sans bg-slate-950 text-slate-50 selection:bg-blue-500/30`}>
        <GlobalErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
                {children}
              </ThemeProvider>
            </AuthProvider>
          </QueryProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
