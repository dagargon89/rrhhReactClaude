import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { Separator } from "@/components/ui/separator"
import { auth } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  // Determinar qué items mostrar basado en el rol del usuario
  const isAdmin = session?.user?.isSuperuser || session?.user?.isStaff
  const navSections = isAdmin 
    ? [
        // Dashboard (sin sección)
        {
          items: [
            { title: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
          ]
        },
        // Gestión de Personal
        {
          title: "Gestión de Personal",
          items: [
            { title: "Usuarios", href: "/admin/users", icon: "UserCheck" },
            { title: "Empleados", href: "/admin/employees", icon: "Users" },
            { title: "Departamentos", href: "/admin/departments", icon: "Building2" },
            { title: "Posiciones", href: "/admin/positions", icon: "Briefcase" },
          ]
        },
        // Tiempo y Asistencia
        {
          title: "Tiempo y Asistencia",
          items: [
            { title: "Turnos", href: "/admin/work-shifts", icon: "Clock" },
            { title: "Asistencias", href: "/admin/attendance", icon: "UserCheck" },
          ]
        },
        // Disciplina y Tardanzas
        {
          title: "Disciplina y Tardanzas",
          items: [
            { title: "Reglas de Tardanzas", href: "/admin/tardiness-rules", icon: "Clock" },
            { title: "Acumulaciones Mensuales", href: "/admin/tardiness-accumulations", icon: "TrendingUp" },
            { title: "Actas Disciplinarias", href: "/admin/disciplinary-records", icon: "ShieldAlert" },
          ]
        },
        // Permisos
        {
          title: "Permisos",
          items: [
            { title: "Vacaciones", href: "/admin/leaves", icon: "Palmtree" },
          ]
        },
        // Otros
        {
          title: "Otros",
          items: [
            { title: "Incidencias", href: "/admin/incidents", icon: "AlertTriangle" },
            { title: "Reportes", href: "/admin/reports", icon: "BarChart3" },
          ]
        },
        // Mi Cuenta
        {
          title: "Mi Cuenta",
          items: [
            { title: "Mi Asistencia", href: "/admin/mi-cuenta/asistencia", icon: "Clock" },
            { title: "Mis Vacaciones", href: "/admin/mi-cuenta/vacaciones", icon: "Palmtree" },
            { title: "Mi Perfil", href: "/admin/mi-cuenta/perfil", icon: "User" },
          ]
        },
      ]
    : [
        // Dashboard empleado
        {
          items: [
            { title: "Dashboard", href: "/employee/dashboard", icon: "LayoutDashboard" },
          ]
        },
        // Sección empleado
        {
          title: "Mi Información",
          items: [
            { title: "Mi Asistencia", href: "/employee/attendance", icon: "Clock" },
            { title: "Mis Vacaciones", href: "/employee/leaves", icon: "Palmtree" },
            { title: "Mi Perfil", href: "/employee/profile", icon: "Users" },
          ]
        },
      ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <Navbar mobileMenu={<MobileSidebar sections={navSections} />} />
      </div>
      
      {/* Layout principal */}
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar sections={navSections} />
        </div>
        
        {/* Separador */}
        <Separator orientation="vertical" className="hidden lg:block" />
        
        {/* Contenido principal */}
        <div className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
