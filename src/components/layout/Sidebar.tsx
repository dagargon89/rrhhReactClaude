"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  BarChart3,
  Building2,
  Briefcase,
  UserCheck,
  Palmtree,
  TrendingUp,
  ShieldAlert,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface NavItem {
  title: string
  href: string
  icon: string
}

interface NavSection {
  title?: string // Si no tiene título, es un item suelto
  items: NavItem[]
}

interface SidebarProps {
  sections: NavSection[]
}

// Mapeo de iconos
const iconMap = {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  BarChart3,
  Building2,
  Briefcase,
  UserCheck,
  Palmtree,
  TrendingUp,
  ShieldAlert,
}

export function Sidebar({ sections }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-white dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Título de la sección (si existe) */}
            {section.title && (
              <>
                {sectionIndex > 0 && <Separator className="my-4" />}
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              </>
            )}

            {/* Items de la sección */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap]
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
