"use client"

import { QueryClient, QueryClientProvider, QueryClientConfig } from "@tanstack/react-query";

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Pencereye odaklanıldığında tekrar veri çekmeyi kapatır
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
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
