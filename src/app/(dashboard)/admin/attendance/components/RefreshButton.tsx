"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function RefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      router.refresh()
      toast.success("Datos actualizados")
    } catch (error) {
      toast.error("Error al actualizar")
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  return (
    <Button
      variant="outline"
      size="default"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      Actualizar
    </Button>
  )
}
