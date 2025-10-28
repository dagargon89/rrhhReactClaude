import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EditTardinessAccumulationForm } from "./EditTardinessAccumulationForm"

async function getTardinessAccumulation(id: string) {
  const accumulation = await prisma.tardinessAccumulation.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          department: {
            select: {
              name: true,
            },
          },
          position: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  })

  return accumulation
}

export default async function EditTardinessAccumulationPage({
  params,
}: {
  params: { id: string }
}) {
  const accumulation = await getTardinessAccumulation(params.id)

  if (!accumulation) {
    notFound()
  }

  // Serializar fechas
  const serializedAccumulation = {
    ...accumulation,
    createdAt: accumulation.createdAt.toISOString(),
    updatedAt: accumulation.updatedAt.toISOString(),
  }

  return <EditTardinessAccumulationForm accumulation={serializedAccumulation} />
}
