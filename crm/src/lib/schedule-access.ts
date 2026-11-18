import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"

/**
 * Server-side gate for doctor-schedule data (availability, leave, calendar, per-doctor appointments, workload).
 * Allowed: ADMIN, RECEPTIONIST and DOCTOR accounts that hold the "schedule" scope. A DOCTOR may only
 * touch their own schedule; passing another doctor's id is rejected. BILLING (or any other role) never passes,
 * even if its permissions array lists the scope.
 */
export async function requireScheduleAccess(doctorId?: string | null) {
  const user = await getCurrentUser()
  if (!["ADMIN", "RECEPTIONIST", "DOCTOR"].includes(user.role) || !canAccess(user, "schedule")) {
    throw new Error("Forbidden: you do not have access to doctor schedules")
  }
  if (user.role === "DOCTOR" && doctorId && doctorId !== user.id) {
    throw new Error("Forbidden: doctors can only view their own schedule")
  }
  return user
}

/** Same check but returns null instead of throwing (for pages that render a restricted panel). */
export async function checkScheduleAccess(doctorId?: string | null) {
  try {
    return await requireScheduleAccess(doctorId)
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Forbidden")) return null
    throw e
  }
}
