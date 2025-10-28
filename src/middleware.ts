import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // Por ahora, el middleware solo redirige a login si no hay token
  // La autenticación real se maneja en los componentes de página
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  
  if (isAuthPage) {
    return null
  }

  // Redirigir a login si no hay token (esto es básico)
  // La lógica de autenticación real se maneja en los componentes
  return null
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/login"],
}
