"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, User } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Department {
  id: string
  name: string
}

interface Position {
  id: string
  title: string
}

interface Employee {
  id: string
  employeeCode: string
  dateOfBirth: string | null
  phone: string | null
  address: string | null
  departmentId: string | null
  positionId: string | null
  hireDate: string
  employmentType: string
  status: string
  user: {
    email: string
    firstName: string
    lastName: string
    username: string | null
  }
}

interface EditEmployeePageProps {
  params: { id: string }
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  
  const [formData, setFormData] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    departmentId: "",
    positionId: "",
    hireDate: "",
    employmentType: "FULL_TIME",
    status: "ACTIVE",
    email: "",
    username: "",
  })

  // Cargar datos del empleado y opciones
  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeeRes, deptRes, posRes] = await Promise.all([
          fetch(`/api/employees/${params.id}`),
          fetch("/api/departments"),
          fetch("/api/positions")
        ])
        
        if (employeeRes.ok) {
          const employeeData = await employeeRes.json()
          setEmployee(employeeData)
          setFormData({
            employeeCode: employeeData.employeeCode,
            firstName: employeeData.user?.firstName || "",
            lastName: employeeData.user?.lastName || "",
            dateOfBirth: employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth).toISOString().split('T')[0] : "",
            phone: employeeData.phone || "",
            address: employeeData.address || "",
            departmentId: employeeData.departmentId || "",
            positionId: employeeData.positionId || "",
            hireDate: new Date(employeeData.hireDate).toISOString().split('T')[0],
            employmentType: employeeData.employmentType,
            status: employeeData.status,
            email: employeeData.user?.email || "",
            username: employeeData.user?.username || "",
          })
        }
        
        if (deptRes.ok) {
          const deptData = await deptRes.json()
          // La API ahora devuelve un array directamente
          setDepartments(Array.isArray(deptData) ? deptData : deptData.departments || [])
        }

        if (posRes.ok) {
          const posData = await posRes.json()
          // La API ahora devuelve un array directamente
          setPositions(Array.isArray(posData) ? posData : posData.positions || [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar los datos")
      } finally {
        setLoadingData(false)
      }
    }
    
    loadData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Preparar datos para enviar
      const payload: any = {
        employeeCode: formData.employeeCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth : null,
        phone: formData.phone || null,
        address: formData.address || null,
        departmentId: formData.departmentId || null,
        positionId: formData.positionId || null,
        hireDate: formData.hireDate,
        employmentType: formData.employmentType,
        status: formData.status,
        email: formData.email,
      }

      // Solo agregar username si tiene valor
      if (formData.username) {
        payload.username = formData.username
      }

      const response = await fetch(`/api/employees/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success("Empleado actualizado exitosamente")
        router.push(`/admin/employees/${params.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al actualizar empleado")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar empleado")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Empleado no encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/admin/employees">Volver a la lista</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/employees/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Empleado</h1>
          <p className="text-muted-foreground">
            Modificar información de {employee.user?.firstName || "N/A"} {employee.user?.lastName || "N/A"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Empleado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeCode">Código de Empleado *</Label>
                <Input
                  id="employeeCode"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  required
                  placeholder="EMP001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Fecha de Contratación *</Label>
                <Input
                  id="hireDate"
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle 123, Ciudad, País"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departmentId">Departamento</Label>
                <select
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar departamento</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="positionId">Posición</Label>
                <select
                  id="positionId"
                  name="positionId"
                  value={formData.positionId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar posición</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentType">Tipo de Empleo</Label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="FULL_TIME">Tiempo Completo</option>
                  <option value="PART_TIME">Medio Tiempo</option>
                  <option value="CONTRACT">Contrato</option>
                  <option value="INTERN">Practicante</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="ON_LEAVE">En Permiso</option>
                  <option value="TERMINATED">Terminado</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="empleado@empresa.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="usuario123"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/admin/employees/${params.id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
