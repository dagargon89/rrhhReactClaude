"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, UserPlus } from "lucide-react"
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

export default function NewEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Datos del usuario
    email: "",
    password: "",
    username: "",
    
    // Datos del empleado
    employeeCode: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    departmentId: "",
    positionId: "",
    defaultShiftId: "",
    hireDate: "",
    employmentType: "FULL_TIME" as const,
    status: "ACTIVE" as const,
  })

  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [workShifts, setWorkShifts] = useState<any[]>([])

  // Cargar departamentos, posiciones y turnos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptRes, posRes, shiftsRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/positions"),
          fetch("/api/work-shifts")
        ])

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

        if (shiftsRes.ok) {
          const shiftsData = await shiftsRes.json()
          setWorkShifts(Array.isArray(shiftsData) ? shiftsData : [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar departamentos, posiciones y turnos")
      }
    }

    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            email: formData.email,
            password: formData.password,
            username: formData.username,
          },
          employeeCode: formData.employeeCode,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
          phone: formData.phone,
          address: formData.address,
          departmentId: formData.departmentId || null,
          positionId: formData.positionId || null,
          defaultShiftId: formData.defaultShiftId || null,
          hireDate: new Date(formData.hireDate),
          employmentType: formData.employmentType,
          status: formData.status,
        }),
      })

      if (response.ok) {
        toast.success("Empleado creado exitosamente")
        router.push("/admin/employees")
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al crear empleado")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al crear empleado")
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/employees">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Empleado</h1>
          <p className="text-muted-foreground">
            Agregar un nuevo empleado al sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="empleado@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Contraseña segura"
                />
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Empleado</CardTitle>
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
                <Label htmlFor="defaultShiftId">Turno de Trabajo</Label>
                <select
                  id="defaultShiftId"
                  name="defaultShiftId"
                  value={formData.defaultShiftId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar turno</option>
                  {workShifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/employees">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Guardando..." : "Guardar Empleado"}
          </Button>
        </div>
      </form>
    </div>
  )
}
