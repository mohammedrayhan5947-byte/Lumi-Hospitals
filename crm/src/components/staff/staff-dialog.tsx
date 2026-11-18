"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Copy, Eye, EyeOff, Plus, TriangleAlert } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScopePicker } from "@/components/staff/scope-picker"
import { createStaff, updateStaff, type StaffRow } from "@/actions/staff"

export const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "BILLING", label: "Billing" },
] as const

export function CopyBox({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 rounded-md border bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>This password is shown only once. Share it securely with the staff member; it cannot be viewed again.</span>
      </div>
      <Label htmlFor="generated-password">{label}</Label>
      <div className="flex gap-2">
        <Input id="generated-password" readOnly value={value} className="font-mono" onFocus={(e) => e.currentTarget.select()} />
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            } catch {
              toast.error("Could not copy; select the text and copy manually")
            }
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  )
}

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

interface Props {
  /** When provided the dialog edits this member; otherwise it creates one and renders its own trigger. */
  staff?: StaffRow
  currentUserId?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function StaffDialog({ staff, currentUserId, open: openProp, onOpenChange }: Props) {
  const editing = !!staff
  const [openState, setOpenState] = useState(false)
  const open = editing ? !!openProp : openState
  const setOpen = (v: boolean) => (editing ? onOpenChange?.(v) : setOpenState(v))

  const [name, setName] = useState(staff?.name ?? "")
  const [email, setEmail] = useState(staff?.email ?? "")
  const [phone, setPhone] = useState(staff?.phone ?? "")
  const [role, setRole] = useState<string>(staff?.role ?? "RECEPTIONIST")
  const [specialization, setSpecialization] = useState(staff?.specialization ?? "")
  const [fee, setFee] = useState(staff?.consultationFee != null ? String(staff.consultationFee) : "")
  const [active, setActive] = useState(staff?.active ?? true)
  const [useDefaults, setUseDefaults] = useState((staff?.permissions.length ?? 0) === 0)
  const [scopes, setScopes] = useState<string[]>(staff?.permissions ?? [])
  const [autoPassword, setAutoPassword] = useState(true)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const isSelf = !!staff && staff.id === currentUserId

  function reset() {
    setName(""); setEmail(""); setPhone(""); setRole("RECEPTIONIST"); setSpecialization(""); setFee("")
    setUseDefaults(true); setScopes([]); setAutoPassword(true); setPassword(""); setShowPassword(false); setCreated(null)
  }

  function close(v: boolean) {
    setOpen(v)
    if (!v && !editing) reset()
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const common = {
      name,
      phone: phone || null,
      role: role as "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "BILLING",
      specialization: role === "DOCTOR" ? specialization || null : null,
      consultationFee: role === "DOCTOR" && fee !== "" ? Number(fee) : null,
      permissions: useDefaults || role === "ADMIN" ? [] : scopes,
    }
    startTransition(async () => {
      if (staff) {
        const res = await updateStaff(staff.id, { ...common, active })
        if (!res.ok) return void toast.error(res.error)
        toast.success("Staff updated")
        setOpen(false)
        router.refresh()
      } else {
        const res = await createStaff({ ...common, email, autoPassword, password: autoPassword ? undefined : password })
        if (!res.ok) return void toast.error(res.error)
        toast.success("Staff account created")
        router.refresh()
        if (res.generatedPassword) setCreated({ email: res.staff.email, password: res.generatedPassword })
        else close(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      {!editing && (
        <Button className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add staff
        </Button>
      )}
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        {created ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Account created</DialogTitle>
              <DialogDescription>Login ID: <span className="font-medium text-foreground">{created.email}</span></DialogDescription>
            </DialogHeader>
            <CopyBox value={created.password} label="Temporary password" />
            <Button className="w-full" onClick={() => close(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit staff" : "Add staff"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update details, access and status." : "Create a login for a new team member."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="st-name">Full name</Label>
                <Input id="st-name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="st-email">Login email</Label>
                <Input
                  id="st-email"
                  type="email"
                  required
                  disabled={editing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="st-phone">Phone</Label>
                <Input id="st-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="st-role">Role</Label>
                <select
                  id="st-role"
                  className={selectClass}
                  value={role}
                  disabled={isSelf}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {isSelf && <p className="text-xs text-muted-foreground">You cannot change your own role.</p>}
              </div>
              {role === "DOCTOR" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="st-spec">Specialization</Label>
                    <Input id="st-spec" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Cardiology" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="st-fee">Consultation fee (₹)</Label>
                    <Input id="st-fee" type="number" min={0} value={fee} onChange={(e) => setFee(e.target.value)} />
                  </div>
                </>
              )}
            </div>

            {!editing && (
              <div className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="st-auto" className="text-sm font-medium">
                    Auto-generate password
                    <span className="block text-xs font-normal text-muted-foreground">A strong 12-character password, shown once.</span>
                  </label>
                  <Switch id="st-auto" checked={autoPassword} onCheckedChange={setAutoPassword} />
                </div>
                {!autoPassword && (
                  <div className="space-y-1.5">
                    <Label htmlFor="st-pw">Password (min 8 characters)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="st-pw"
                        type={showPassword ? "text" : "password"}
                        minLength={8}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((s) => !s)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Access</h3>
              <ScopePicker
                role={role}
                useDefaults={useDefaults}
                onUseDefaultsChange={setUseDefaults}
                value={scopes}
                onChange={setScopes}
              />
            </div>

            {editing && (
              <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                <label htmlFor="st-active" className="text-sm font-medium">
                  Account active
                  <span className="block text-xs font-normal text-muted-foreground">
                    {isSelf ? "You cannot deactivate yourself." : "Inactive users are signed out immediately."}
                  </span>
                </label>
                <Switch id="st-active" checked={active} disabled={isSelf} onCheckedChange={setActive} />
              </div>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving…" : editing ? "Save changes" : "Create account"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
