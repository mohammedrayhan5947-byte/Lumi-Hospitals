"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { KeyRound, Pencil, UserCheck, UserX } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StaffDialog, CopyBox, ROLE_OPTIONS } from "@/components/staff/staff-dialog"
import { ROLE_DEFAULTS, SCOPES } from "@/lib/permissions"
import { resetStaffPassword, setStaffActive, type StaffRow } from "@/actions/staff"

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?"
}

function accessSummary(s: StaffRow) {
  if (s.role === "ADMIN") return "All sections"
  if (s.permissions.length === 0) return `Role default (${(ROLE_DEFAULTS[s.role] ?? []).length})`
  return `${s.permissions.length} of ${SCOPES.length} sections`
}

export function StaffTable({ staff, currentUserId }: { staff: StaffRow[]; currentUserId: string }) {
  const [editing, setEditing] = useState<StaffRow | null>(null)
  const [reset, setReset] = useState<{ name: string; password: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function toggleActive(s: StaffRow) {
    if (s.active && !confirm(`Deactivate ${s.name}? They will be signed out immediately.`)) return
    startTransition(async () => {
      const res = await setStaffActive(s.id, !s.active)
      if (!res.ok) return void toast.error(res.error)
      toast.success(s.active ? "Staff deactivated" : "Staff reactivated")
      router.refresh()
    })
  }

  function resetPassword(s: StaffRow) {
    if (!confirm(`Reset password for ${s.name}? Their current password will stop working.`)) return
    startTransition(async () => {
      const res = await resetStaffPassword(s.id)
      if (!res.ok) return void toast.error(res.error)
      setReset({ name: s.name, password: res.generatedPassword })
      router.refresh()
    })
  }

  if (staff.length === 0) {
    return <p className="p-8 text-center text-sm text-muted-foreground">No staff found.</p>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Login email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Access</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((s) => {
            const self = s.id === currentUserId
            return (
              <TableRow key={s.id} className={s.active ? undefined : "opacity-60"}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials(s.name)}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium">{s.name}{self && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}</div>
                      {s.role === "DOCTOR" && s.specialization && <div className="text-xs text-muted-foreground">{s.specialization}</div>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{s.email}</TableCell>
                <TableCell><Badge variant={s.role === "ADMIN" ? "default" : "secondary"}>{ROLE_OPTIONS.find((r) => r.value === s.role)?.label}</Badge></TableCell>
                <TableCell className="whitespace-nowrap text-sm">{accessSummary(s)}</TableCell>
                <TableCell><Badge variant={s.active ? "outline" : "destructive"}>{s.active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${s.name}`} title="Edit" onClick={() => setEditing(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Reset password for ${s.name}`} title="Reset password" disabled={pending} onClick={() => resetPassword(s)}>
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    {!self && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`${s.active ? "Deactivate" : "Reactivate"} ${s.name}`}
                        title={s.active ? "Deactivate" : "Reactivate"}
                        disabled={pending}
                        onClick={() => toggleActive(s)}
                      >
                        {s.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {editing && (
        <StaffDialog
          key={editing.id}
          staff={editing}
          currentUserId={currentUserId}
          open
          onOpenChange={(v) => !v && setEditing(null)}
        />
      )}

      <Dialog open={!!reset} onOpenChange={(v) => !v && setReset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password reset</DialogTitle>
            <DialogDescription>New password for {reset?.name}.</DialogDescription>
          </DialogHeader>
          {reset && <CopyBox value={reset.password} label="New password" />}
          <Button onClick={() => setReset(null)}>Done</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
