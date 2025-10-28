import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-50 rounded-full">
            <AlertCircle className="h-16 w-16 text-blue-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Empleado no encontrado
          </h1>
          <p className="text-lg text-muted-foreground">
            No se encontraron registros de acumulaciones para este empleado.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
          <Link href="/admin/tardiness-accumulations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Acumulaciones
          </Link>
        </Button>
      </div>
    </div>
  )
}
