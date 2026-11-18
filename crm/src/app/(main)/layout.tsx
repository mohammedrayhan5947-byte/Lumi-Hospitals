import { redirect } from "next/navigation"
import { getCurrentUserOrNull } from "@/lib/auth"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { Header } from "@/components/layout/header"
import { AccessGuard } from "@/components/layout/access-guard"

export const dynamic = "force-dynamic"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserOrNull()
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex flex-1 min-h-screen">
      <SidebarNav role={user.role} permissions={user.permissions} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header user={{ name: user.name, role: user.role, permissions: user.permissions }} />
        <main className="flex-1 min-w-0 p-4 lg:p-6 print:p-0">
          <div className="mb-3 hidden items-baseline justify-between border-b pb-2 print:flex">
            <span className="text-base font-semibold">Lumi Hospitals</span>
            <span className="text-xs text-muted-foreground">Printed {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} by {user.name}</span>
          </div>
          <AccessGuard role={user.role} permissions={user.permissions}>{children}</AccessGuard>
        </main>
      </div>
    </div>
  )
}
