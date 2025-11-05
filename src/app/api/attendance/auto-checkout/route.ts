import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { processAutoCheckout } from "@/services/autoCheckoutService"

/**
 * POST /api/attendance/auto-checkout
 * Ejecuta manualmente el proceso de auto-checkout para todas las asistencias pendientes
 * Solo accesible por usuarios staff/admin
 * Body: { date?: string } - Fecha en formato ISO (opcional, por defecto usa hoy)
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    // Solo usuarios staff o superuser pueden ejecutar auto-checkout manual
    if (!session.user.isStaff && !session.user.isSuperuser) {
      return NextResponse.json(
        { error: "No autorizado. Solo administradores pueden ejecutar auto-checkout manual." },
        { status: 403 }
      )
    }

    // Obtener la fecha del body (opcional)
    const body = await request.json()
    let targetDate: Date | undefined

    if (body.date) {
      targetDate = new Date(body.date)
      // Validar que la fecha sea válida
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json(
          { error: "Fecha inválida" },
          { status: 400 }
        )
      }
      console.log(`🔐 Usuario ${session.user.email} ejecutando auto-checkout manual para fecha: ${targetDate.toISOString()}`)
    } else {
      console.log(`🔐 Usuario ${session.user.email} ejecutando auto-checkout manual para hoy`)
    }

    // Ejecutar el proceso de auto-checkout
    const result = await processAutoCheckout(targetDate)

    return NextResponse.json({
      success: true,
      message: `Auto-checkout completado: ${result.processed} procesados, ${result.errors} errores`,
      data: result
    })

  } catch (error) {
    console.error("Error en auto-checkout manual:", error)
    return NextResponse.json(
      {
        error: "Error al ejecutar auto-checkout",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}
