"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table2, Calendar } from "lucide-react"
import { AttendancesTableEnhanced } from "./AttendancesTableEnhanced"
import { AttendanceGroupedView } from "./AttendanceGroupedView"

interface Employee {
  id: string
  employeeCode: string
  user: {
    firstName: string
    lastName: string
  }
  department?: {
    name: string
  } | null
  defaultShift?: {
    name: string
    code: string
  } | null
}

interface Attendance {
  id: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  checkInMethod: string | null
  checkOutMethod: string | null
  checkInLocation: string | null
  checkOutLocation: string | null
  workedHours: string
  overtimeHours: string
  status: string
  isAutoCheckout: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
  employee: Employee
  shiftOverride: {
    name: string
    code: string
  } | null
  _count?: {
    [key: string]: number
  }
}

interface AttendanceViewTabsProps {
  attendances: Attendance[]
}

export function AttendanceViewTabs({ attendances }: AttendanceViewTabsProps) {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
        <TabsTrigger value="list" className="flex items-center gap-2">
          <Table2 className="h-4 w-4" />
          Vista de Lista
        </TabsTrigger>
        <TabsTrigger value="grouped" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Vista por Fecha
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="mt-0">
        <AttendancesTableEnhanced attendances={attendances} />
      </TabsContent>

      <TabsContent value="grouped" className="mt-0">
        <AttendanceGroupedView attendances={attendances} />
      </TabsContent>
    </Tabs>
  )
}
