"use client"

import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Building2, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { AttendanceWidget } from "./AttendanceWidget"

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-auto min-h-16 items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">HRMS</h1>
              <p className="text-xs text-muted-foreground">
                Gestión de Recursos Humanos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AttendanceWidget />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>

            <Avatar>
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback>
                {session?.user?.name ? getInitials(session.user.name) : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
