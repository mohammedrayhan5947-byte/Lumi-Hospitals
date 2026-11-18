// Section scopes: which parts of the CRM an account can open.
// A user's `permissions` column overrides the role default when it is non-empty. ADMIN always has everything.

export const SCOPES = [
  { key: "dashboard", label: "Dashboard", group: "Care" },
  { key: "patients", label: "Patients", group: "Care" },
  { key: "appointments", label: "Appointments", group: "Care" },
  { key: "queue", label: "Queue & tokens", group: "Care" },
  { key: "waiting-list", label: "Waiting list", group: "Care" },
  { key: "follow-ups", label: "Follow-ups", group: "Care" },
  { key: "communications", label: "Communications", group: "Care" },
  { key: "inventory", label: "Inventory", group: "Care" },
  { key: "clinical", label: "Clinical (availability, templates, signature)", group: "Clinical" },
  { key: "billing", label: "Billing & refunds", group: "Finance" },
  { key: "finance", label: "Finance (cash counter, expenses, dues)", group: "Finance" },
  { key: "services", label: "Services & pricing", group: "Finance" },
  { key: "reports", label: "Reports", group: "Finance" },
  { key: "calendar", label: "Calendar", group: "Other" },
  { key: "schedule", label: "Doctor schedule & calendar", group: "Clinical" },
  { key: "website", label: "Website content", group: "Admin" },
  { key: "audit-logs", label: "Audit logs", group: "Admin" },
  { key: "staff", label: "Staff management", group: "Admin" },
  { key: "documents", label: "Stored documents (PDFs)", group: "Admin" },
] as const

export type Scope = (typeof SCOPES)[number]["key"]
export const ALL_SCOPES: Scope[] = SCOPES.map((s) => s.key)

export const ROLE_DEFAULTS: Record<string, Scope[]> = {
  ADMIN: ALL_SCOPES,
  DOCTOR: ["dashboard", "patients", "appointments", "queue", "follow-ups", "clinical", "calendar", "schedule"],
  RECEPTIONIST: ["dashboard", "patients", "appointments", "queue", "waiting-list", "follow-ups", "communications", "calendar", "schedule"],
  BILLING: ["dashboard", "patients", "billing", "finance", "services", "reports", "inventory"],
}

export function scopesFor(user: { role: string; permissions?: string[] | null }): Scope[] {
  if (user.role === "ADMIN") return ALL_SCOPES
  const custom = (user.permissions ?? []).filter((p): p is Scope => (ALL_SCOPES as string[]).includes(p))
  return custom.length ? custom : ROLE_DEFAULTS[user.role] ?? ["dashboard"]
}

export function canAccess(user: { role: string; permissions?: string[] | null }, scope: Scope) {
  return scopesFor(user).includes(scope)
}

/** URL path -> scope. First matching prefix wins. */
const PATH_SCOPES: [string, Scope][] = [
  ["/dashboard", "dashboard"],
  ["/patients", "patients"],
  ["/appointments/availability", "schedule"],
  ["/appointments", "appointments"],
  ["/queue", "queue"],
  ["/waiting-list", "waiting-list"],
  ["/follow-ups", "follow-ups"],
  ["/communications", "communications"],
  ["/inventory", "inventory"],
  ["/templates", "clinical"],
  ["/settings/signature", "clinical"],
  ["/billing", "billing"],
  ["/finance/reports", "reports"],
  ["/reports", "reports"],
  ["/finance", "finance"],
  ["/services", "services"],
  ["/calendar", "schedule"],
  ["/website", "website"],
  ["/audit-logs", "audit-logs"],
  ["/staff", "staff"],
  ["/documents", "documents"],
  ["/search", "patients"],
]

export function scopeForPath(pathname: string): Scope | null {
  const hit = PATH_SCOPES.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/"))
  return hit ? hit[1] : null
}
