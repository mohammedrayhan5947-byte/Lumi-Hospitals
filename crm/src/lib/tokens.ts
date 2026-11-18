import { format } from "date-fns"
import type { Prisma } from "@/generated/prisma/client"

/** "YYYY-MM-DD" in the server's pinned timezone (Asia/Kolkata): the day a token belongs to. */
export const tokenDayKey = (d: Date) => format(d, "yyyy-MM-dd")

/** Display form, e.g. 7 -> "T-007". */
export const formatToken = (n: number | null | undefined) => (n == null ? "—" : `T-${String(n).padStart(3, "0")}`)

/**
 * Next queue token for ONE doctor on the appointment's day (1, 2, 3 ... per doctor per day, never reused,
 * cancelled tokens stay burned). Call inside the same transaction that creates the appointment; the advisory
 * lock makes concurrent bookings for the same doctor and day take consecutive numbers instead of colliding.
 */
export async function nextToken(tx: Prisma.TransactionClient, when: Date, doctorId: string) {
  const tokenDate = tokenDayKey(when)
  await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${"token:" + tokenDate + ":" + doctorId}))`
  const agg = await tx.appointment.aggregate({ where: { tokenDate, doctorId }, _max: { tokenNumber: true } })
  return { tokenDate, tokenNumber: (agg._max.tokenNumber ?? 0) + 1 }
}
