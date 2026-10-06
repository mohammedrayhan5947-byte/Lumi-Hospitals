"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { doctorTemplateSchema, type DoctorTemplateInput } from "@/lib/validations/emr"

export async function getDoctorTemplates(doctorId: string, type?: "SOAP" | "PRESCRIPTION" | "CERTIFICATE") {
  return prisma.doctorTemplate.findMany({
    where: { doctorId, type },
    orderBy: { name: "asc" },
  })
}

export async function createDoctorTemplate(input: DoctorTemplateInput) {
  const data = doctorTemplateSchema.parse(input)
  const user = await getCurrentUser()
  const template = await prisma.doctorTemplate.create({ data: { ...data, doctorId: user.id } })
  revalidatePath("/templates")
  return template
}

export async function deleteDoctorTemplate(id: string) {
  const user = await getCurrentUser()
  await prisma.doctorTemplate.deleteMany({ where: user.role === "ADMIN" ? { id } : { id, doctorId: user.id } })
  revalidatePath("/templates")
}
