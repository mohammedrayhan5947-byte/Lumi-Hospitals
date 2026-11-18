import { prisma } from "@/lib/prisma"
import { safeRevalidatePath } from "@/lib/revalidate"

function refresh() {
  for (const p of ["/calendar", "/queue", "/dashboard", "/appointments"]) safeRevalidatePath(p)
}

/**
 * Doctor started working on an encounter: a checked-in patient becomes IN_CONSULTATION (startedAt = now),
 * and an already-running consultation with no startedAt gets one. No-op for any other status.
 */
export async function markConsultationStarted(appointmentId: string | null | undefined) {
  if (!appointmentId) return
  const now = new Date()
  const a = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { status: true, startedAt: true, checkedInAt: true },
  })
  if (!a) return
  if (a.status === "ARRIVED") {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "IN_CONSULTATION", startedAt: a.startedAt ?? now, checkedInAt: a.checkedInAt ?? now },
    })
    refresh()
  } else if (a.status === "IN_CONSULTATION" && !a.startedAt) {
    await prisma.appointment.update({ where: { id: appointmentId }, data: { startedAt: a.checkedInAt ?? now } })
    refresh()
  }
}

/**
 * Doctor finalised the encounter: an ARRIVED / IN_CONSULTATION appointment becomes COMPLETED with
 * completedAt = now (startedAt back-filled from checkedInAt or now so the actual duration is stored).
 */
export async function markConsultationCompleted(appointmentId: string | null | undefined) {
  if (!appointmentId) return
  const now = new Date()
  const a = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { status: true, startedAt: true, checkedInAt: true },
  })
  if (!a || (a.status !== "ARRIVED" && a.status !== "IN_CONSULTATION")) return
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "COMPLETED", completedAt: now, startedAt: a.startedAt ?? a.checkedInAt ?? now },
  })
  refresh()
}
