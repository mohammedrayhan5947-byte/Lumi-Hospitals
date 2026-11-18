"use server"

import { randomInt } from "node:crypto"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireRole, hashPassword } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { ALL_SCOPES } from "@/lib/permissions"
import type { Prisma } from "@/generated/prisma/client"

const ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST", "BILLING"] as const

const baseFields = {
  name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().max(20).optional().nullable(),
  role: z.enum(ROLES),
  specialization: z.string().trim().max(100).optional().nullable(),
  consultationFee: z.coerce.number().min(0).max(1_000_000).optional().nullable(),
  permissions: z.array(z.string()).default([]),
}

const createSchema = z.object({
  ...baseFields,
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  autoPassword: z.boolean(),
  password: z.string().optional(),
})

const updateSchema = z.object({ ...baseFields, active: z.boolean() })

export interface StaffRow {
  id: string
  name: string
  email: string
  phone: string | null
  role: (typeof ROLES)[number]
  specialization: string | null
  consultationFee: number | null
  active: boolean
  permissions: string[]
  createdAt: Date
}

export type StaffActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string }

const select = {
  id: true, name: true, email: true, phone: true, role: true, specialization: true,
  consultationFee: true, active: true, permissions: true, createdAt: true,
} satisfies Prisma.UserSelect

function toRow(u: Prisma.UserGetPayload<{ select: typeof select }>): StaffRow {
  return { ...u, consultationFee: u.consultationFee == null ? null : Number(u.consultationFee) }
}

function cleanScopes(perms: string[]) {
  return ALL_SCOPES.filter((s) => perms.includes(s))
}

function generatePassword(length = 12) {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%^&*"]
  const all = sets.join("")
  const chars = sets.map((s) => s[randomInt(s.length)])
  while (chars.length < length) chars.push(all[randomInt(all.length)])
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join("")
}

async function uniqueSlug(name: string) {
  const base = name.toLowerCase().replace(/^dr\.?\s+/, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "doctor"
  let slug = base
  for (let i = 2; await prisma.user.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`
  return slug
}

function fail(err: unknown): { ok: false; error: string } {
  if (err instanceof z.ZodError) return { ok: false, error: err.issues[0]?.message ?? "Invalid input" }
  // Let Next.js control-flow errors (redirect/notFound) propagate
  if (err instanceof Error && !("digest" in err)) return { ok: false, error: err.message }
  throw err
}

function otherActiveAdmins(excludeId: string) {
  return prisma.user.count({ where: { role: "ADMIN", active: true, id: { not: excludeId } } })
}

export async function listStaff(): Promise<StaffRow[]> {
  await requireRole("ADMIN")
  const users = await prisma.user.findMany({ select, orderBy: [{ active: "desc" }, { name: "asc" }] })
  return users.map(toRow)
}

export async function createStaff(
  input: z.input<typeof createSchema>
): Promise<StaffActionResult<{ staff: StaffRow; generatedPassword: string | null }>> {
  try {
    const admin = await requireRole("ADMIN")
    const d = createSchema.parse(input)
    if (!d.autoPassword && (d.password ?? "").length < 8) return { ok: false, error: "Password must be at least 8 characters" }
    if (await prisma.user.findUnique({ where: { email: d.email }, select: { id: true } })) {
      return { ok: false, error: "That email is already in use" }
    }
    const password = d.autoPassword ? generatePassword() : d.password!
    const isDoctor = d.role === "DOCTOR"
    const user = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        phone: d.phone || null,
        role: d.role,
        passwordHash: hashPassword(password),
        specialization: isDoctor ? d.specialization || null : null,
        consultationFee: isDoctor && d.consultationFee != null ? d.consultationFee : null,
        slug: isDoctor ? await uniqueSlug(d.name) : null,
        permissions: d.role === "ADMIN" ? [] : cleanScopes(d.permissions),
      },
      select,
    })
    await logAudit({
      action: "PERMISSION_OVERRIDE", entityType: "User", entityId: user.id,
      metadata: { event: "STAFF_CREATED", by: admin.id, email: user.email, role: user.role, permissions: user.permissions },
    })
    revalidatePath("/staff")
    return { ok: true, staff: toRow(user), generatedPassword: d.autoPassword ? password : null }
  } catch (err) {
    return fail(err)
  }
}

export async function updateStaff(id: string, input: z.input<typeof updateSchema>): Promise<StaffActionResult<{ staff: StaffRow }>> {
  try {
    const admin = await requireRole("ADMIN")
    const d = updateSchema.parse(input)
    const existing = await prisma.user.findUnique({ where: { id }, select: { ...select, slug: true } })
    if (!existing) return { ok: false, error: "Staff member not found" }

    if (id === admin.id && d.role !== "ADMIN") return { ok: false, error: "You cannot change your own role" }
    if (id === admin.id && !d.active) return { ok: false, error: "You cannot deactivate your own account" }
    const losesAdmin = existing.role === "ADMIN" && existing.active && (d.role !== "ADMIN" || !d.active)
    if (losesAdmin && (await otherActiveAdmins(id)) === 0) return { ok: false, error: "At least one active admin is required" }

    const isDoctor = d.role === "DOCTOR"
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: d.name,
        phone: d.phone || null,
        role: d.role,
        active: d.active,
        specialization: isDoctor ? d.specialization || null : null,
        consultationFee: isDoctor && d.consultationFee != null ? d.consultationFee : null,
        ...(isDoctor && !existing.slug ? { slug: await uniqueSlug(d.name) } : {}),
        permissions: d.role === "ADMIN" ? [] : cleanScopes(d.permissions),
      },
      select,
    })
    if (existing.active && !d.active) await prisma.session.deleteMany({ where: { userId: id } })
    await logAudit({
      action: "PERMISSION_OVERRIDE", entityType: "User", entityId: id,
      metadata: {
        event: existing.active && !d.active ? "STAFF_DEACTIVATED" : !existing.active && d.active ? "STAFF_REACTIVATED" : "STAFF_UPDATED",
        by: admin.id, role: { from: existing.role, to: user.role }, permissions: user.permissions, active: user.active,
      },
    })
    revalidatePath("/staff")
    return { ok: true, staff: toRow(user) }
  } catch (err) {
    return fail(err)
  }
}

export async function setStaffActive(id: string, active: boolean): Promise<StaffActionResult<{ staff: StaffRow }>> {
  try {
    const admin = await requireRole("ADMIN")
    z.string().min(1).parse(id)
    const existing = await prisma.user.findUnique({ where: { id }, select })
    if (!existing) return { ok: false, error: "Staff member not found" }
    if (!active) {
      if (id === admin.id) return { ok: false, error: "You cannot deactivate your own account" }
      if (existing.role === "ADMIN" && existing.active && (await otherActiveAdmins(id)) === 0) {
        return { ok: false, error: "At least one active admin is required" }
      }
    }
    const user = await prisma.user.update({ where: { id }, data: { active }, select })
    if (!active) await prisma.session.deleteMany({ where: { userId: id } })
    await logAudit({
      action: "PERMISSION_OVERRIDE", entityType: "User", entityId: id,
      metadata: { event: active ? "STAFF_REACTIVATED" : "STAFF_DEACTIVATED", by: admin.id },
    })
    revalidatePath("/staff")
    return { ok: true, staff: toRow(user) }
  } catch (err) {
    return fail(err)
  }
}

export async function resetStaffPassword(id: string): Promise<StaffActionResult<{ generatedPassword: string }>> {
  try {
    const admin = await requireRole("ADMIN")
    z.string().min(1).parse(id)
    const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!existing) return { ok: false, error: "Staff member not found" }
    const password = generatePassword()
    await prisma.user.update({ where: { id }, data: { passwordHash: hashPassword(password) } })
    // Sign the user out everywhere (skipped when an admin resets their own password)
    if (id !== admin.id) await prisma.session.deleteMany({ where: { userId: id } })
    await logAudit({
      action: "PERMISSION_OVERRIDE", entityType: "User", entityId: id,
      metadata: { event: "STAFF_PASSWORD_RESET", by: admin.id },
    })
    revalidatePath("/staff")
    return { ok: true, generatedPassword: password }
  } catch (err) {
    return fail(err)
  }
}
