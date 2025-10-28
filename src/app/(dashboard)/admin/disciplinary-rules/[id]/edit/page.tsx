import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EditDisciplinaryRuleForm } from "./EditDisciplinaryRuleForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

async function getDisciplinaryRule(id: string) {
  const rule = await prisma.disciplinaryActionRule.findUnique({
    where: { id },
  })

  return rule
}

export default async function EditDisciplinaryRulePage({
  params,
}: {
  params: { id: string }
}) {
  const rule = await getDisciplinaryRule(params.id)

  if (!rule) {
    notFound()
  }

  // Serializar datos para el componente cliente
  const serializedRule = {
    ...rule,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/disciplinary-rules">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Editar Regla Disciplinaria
          </h1>
          <p className="text-lg text-muted-foreground">
            Modificar configuración de {rule.name}
          </p>
        </div>
      </div>

      {/* Formulario de edición (componente cliente) */}
      <EditDisciplinaryRuleForm rule={serializedRule} />
    </div>
  )
}
