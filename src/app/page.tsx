import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Redirect based on user role
  if (session.user.isSuperuser || session.user.isStaff) {
    redirect("/admin/dashboard")
  } else {
    redirect("/employee/dashboard")
  }
}
