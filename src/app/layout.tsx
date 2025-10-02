import GlobalStoreProvider from '@/providers/GlobalStoreProvider';
import QueryClientProvider from '@/providers/QueryClientProvider';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Task Stack',
  description: 'an application for managing tasks',
};

export default function RootLayout({
  children,
}: LayoutProps<'/'>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`text-base antialiased ${inter.className}`}>
        <QueryClientProvider>
          <GlobalStoreProvider>
            <ThemeProvider attribute="class">{children}</ThemeProvider>
          </GlobalStoreProvider>
        </QueryClientProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
