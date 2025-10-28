import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-orange-50 rounded-full">
            <AlertCircle className="h-16 w-16 text-orange-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Regla no encontrada
          </h1>
          <p className="text-lg text-muted-foreground">
            La regla de tardanzas que buscas no existe o ha sido eliminada.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
          <Link href="/admin/tardiness-rules">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Reglas de Tardanzas
          </Link>
        </Button>
      </div>
    </div>
  )
}
