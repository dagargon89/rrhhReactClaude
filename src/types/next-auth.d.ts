import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isStaff: boolean
      isSuperuser: boolean
      employeeId?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    isStaff: boolean
    isSuperuser: boolean
    employeeId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    isStaff: boolean
    isSuperuser: boolean
    employeeId?: string
  }
}
