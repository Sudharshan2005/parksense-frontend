import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to admin login by default
  redirect("/admin/login")
}
