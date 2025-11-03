"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Menu } from "lucide-react"
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

interface NavItem {
  title: string
  href: string
  icon: string
}

interface NavSection {
  title?: string
  items: NavItem[]
}

interface MobileSidebarProps {
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

export function MobileSidebar({ sections }: MobileSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menú de Navegación</SheetTitle>
        </SheetHeader>

        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-5rem)]">
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
                      onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  )
}
