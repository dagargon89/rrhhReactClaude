import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HRMS - Sistema de Gestión de Recursos Humanos",
  description: "Sistema completo de gestión de recursos humanos",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="light">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
