"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { useState } from "react"
import { SessionTimeoutProvider } from "./providers/session-timeout-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionTimeoutProvider
            timeoutMinutes={Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES) || 60}
            warningMinutes={Number(process.env.NEXT_PUBLIC_SESSION_WARNING_MINUTES) || 5}
          >
            {children}
            <Toaster position="top-right" richColors />
          </SessionTimeoutProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
