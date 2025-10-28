import { Prisma } from "@prisma/client"

// Employee with relations
export type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    user: true
    department: true
    position: true
  }
}>

// Attendance with relations
export type AttendanceWithRelations = Prisma.AttendanceGetPayload<{
  include: {
    employee: {
      include: {
        user: true
        department: true
      }
    }
    schedule: {
      include: {
        shift: true
      }
    }
  }
}>

// Leave Request with relations
export type LeaveRequestWithRelations = Prisma.LeaveRequestGetPayload<{
  include: {
    employee: {
      include: {
        user: true
        department: true
      }
    }
    leaveType: true
    approvedBy: true
  }
}>

// Schedule with relations
export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: {
    employee: {
      include: {
        user: true
      }
    }
    shift: true
  }
}>

// Department with relations
export type DepartmentWithRelations = Prisma.DepartmentGetPayload<{
  include: {
    manager: {
      include: {
        user: true
      }
    }
    parentDepartment: true
    _count: {
      select: {
        employees: true
        subDepartments: true
      }
    }
  }
}>

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter and query params
export interface EmployeeFilters {
  search?: string
  departmentId?: string
  positionId?: string
  status?: string
  employmentType?: string
}

export interface AttendanceFilters {
  employeeId?: string
  departmentId?: string
  startDate?: string
  endDate?: string
  status?: string
}

export interface LeaveRequestFilters {
  employeeId?: string
  status?: string
  leaveTypeId?: string
  startDate?: string
  endDate?: string
}

// Stats and metrics
export interface AttendanceStats {
  totalPresent: number
  totalLate: number
  totalAbsent: number
  averageWorkedHours: number
  overtimeHours: number
}

export interface EmployeeStats {
  totalActive: number
  totalInactive: number
  totalOnLeave: number
  totalTerminated: number
  byDepartment: {
    departmentId: string
    departmentName: string
    count: number
  }[]
  byEmploymentType: {
    type: string
    count: number
  }[]
}

export interface LeaveStats {
  totalRequests: number
  totalPending: number
  totalApproved: number
  totalRejected: number
  byType: {
    typeName: string
    count: number
  }[]
}

export interface IncidentMetrics {
  turnoverRate: number
  absenteeismRate: number
  tardinessCount: number
  period: {
    start: Date
    end: Date
  }
}
