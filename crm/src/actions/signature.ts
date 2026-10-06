"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function getDoctorSignature(doctorId: string) {
  await getCurrentUser()
  return prisma.digitalSignature.findUnique({ where: { doctorId } })
}

export async function saveDoctorSignature(doctorId: string, signatureUrl: string) {
  const user = await getCurrentUser()
  if (user.id !== doctorId && user.role !== "ADMIN") throw new Error("Forbidden: you can only edit your own signature")
  const signature = await prisma.digitalSignature.upsert({
    where: { doctorId },
    create: { doctorId, signatureUrl },
    update: { signatureUrl },
  })
  revalidatePath("/settings/signature")
  return signature
}
