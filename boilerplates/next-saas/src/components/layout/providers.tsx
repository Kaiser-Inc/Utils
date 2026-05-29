"use client";

import { ThemeProvider, Toaster } from "@kaiserinc/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import { type ReactNode, useState } from "react";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("@tanstack/react-query-devtools").then((m) => ({
          default: m.ReactQueryDevtools,
        })),
      )
    : () => null;

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider defaultTheme="dark">
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
          <ReactQueryDevtools />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
