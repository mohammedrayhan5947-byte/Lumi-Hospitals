"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { canAccess, scopeForPath } from "@/lib/permissions"

/** Shows an "access restricted" panel when the signed-in account's scopes don't include this section. */
export function AccessGuard({
  role,
  permissions,
  children,
}: {
  role: string
  permissions: string[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const scope = scopeForPath(pathname)
  if (scope && !canAccess({ role, permissions }, scope)) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-xl border bg-card p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-lg font-semibold">Access restricted</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account doesn&apos;t have access to this section. Ask an administrator to update your permissions.
        </p>
        <Link href="/dashboard" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    )
  }
  return <>{children}</>
}
