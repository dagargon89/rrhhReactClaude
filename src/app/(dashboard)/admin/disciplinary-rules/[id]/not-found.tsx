import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-purple-50 rounded-full">
            <AlertCircle className="h-16 w-16 text-purple-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Regla no encontrada
          </h1>
          <p className="text-lg text-muted-foreground">
            La regla disciplinaria que buscas no existe o ha sido eliminada.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Link href="/admin/disciplinary-rules">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Reglas Disciplinarias
          </Link>
        </Button>
      </div>
    </div>
  )
}
