import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { employee: true },
        })

        if (!user) {
          throw new Error("Usuario no encontrado")
        }

        if (!user.isActive) {
          throw new Error("Usuario inactivo")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta")
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          isStaff: user.isStaff,
          isSuperuser: user.isSuperuser,
          employeeId: user.employee?.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isStaff = user.isStaff
        token.isSuperuser = user.isSuperuser
        token.employeeId = user.employeeId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.isStaff = token.isStaff as boolean
        session.user.isSuperuser = token.isSuperuser as boolean
        session.user.employeeId = token.employeeId as string | undefined
      }
      return session
    },
  },
})

// Tipos de roles
export enum Role {
  SUPERADMIN = "superadmin",
  HR_MANAGER = "hr_manager",
  DEPARTMENT_MANAGER = "department_manager",
  EMPLOYEE = "employee",
}

// Permisos por módulo
export const PERMISSIONS = {
  employees: {
    view: ["superadmin", "hr_manager", "department_manager"],
    create: ["superadmin", "hr_manager"],
    update: ["superadmin", "hr_manager"],
    delete: ["superadmin", "hr_manager"],
  },
  attendance: {
    view: ["superadmin", "hr_manager", "department_manager", "employee"],
    manage: ["superadmin", "hr_manager"],
  },
  schedules: {
    view: ["superadmin", "hr_manager", "department_manager", "employee"],
    manage: ["superadmin", "hr_manager", "department_manager"],
  },
  leave: {
    view: ["superadmin", "hr_manager", "department_manager", "employee"],
    request: ["employee"],
    approve: ["superadmin", "hr_manager", "department_manager"],
  },
  incidents: {
    view: ["superadmin", "hr_manager"],
    generate_reports: ["superadmin", "hr_manager"],
  },
}
