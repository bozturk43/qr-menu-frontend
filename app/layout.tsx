"use client"; // Bu dosyanın bir istemci bileşeni olduğunu belirtir.

import './globals.css';
import { QueryClient, QueryClientProvider, QueryClientConfig } from "@tanstack/react-query";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import theme, { inter, playfair } from '@/app/theme'; // Özel tema ve fontlarımızı import ediyoruz

// React Query Yapılandırması (Sizin mevcut kodunuz)
const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
};
const queryClient = new QueryClient(queryClientConfig);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} ${playfair.className}`}>
        {/* Sağlayıcıları iç içe sarmalıyoruz */}
        <QueryClientProvider client={queryClient}>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              {/* CssBaseline, MUI için temel stilleri sıfırlar */}
              <CssBaseline />
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}