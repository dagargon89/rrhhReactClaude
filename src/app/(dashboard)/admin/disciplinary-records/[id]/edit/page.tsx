import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EditDisciplinaryRecordForm } from "./EditDisciplinaryRecordForm"

async function getDisciplinaryRecord(id: string) {
  const record = await prisma.employeeDisciplinaryRecord.findUnique({
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
      rule: true,
      approvedBy: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  })

  return record
}

export default async function EditDisciplinaryRecordPage({
  params,
}: {
  params: { id: string }
}) {
  const record = await getDisciplinaryRecord(params.id)

  if (!record) {
    notFound()
  }

  // Serializar fechas
  const serializedRecord = {
    ...record,
    appliedDate: record.appliedDate.toISOString(),
    effectiveDate: record.effectiveDate?.toISOString() || null,
    expirationDate: record.expirationDate?.toISOString() || null,
    approvalDate: record.approvalDate?.toISOString() || null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }

  return <EditDisciplinaryRecordForm record={serializedRecord} />
}
