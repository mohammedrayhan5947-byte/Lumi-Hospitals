import { ShieldAlert } from "lucide-react"
import { getAllDoctorsWithAvailability } from "@/actions/appointments"
import { checkScheduleAccess } from "@/lib/schedule-access"
import { DoctorAvailabilityCard } from "@/components/appointments/doctor-availability-card"

export default async function AvailabilityPage() {
  if (!(await checkScheduleAccess())) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-xl border bg-card p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-lg font-semibold">Access restricted</h1>
        <p className="mt-1 text-sm text-muted-foreground">Doctor schedules are visible only to admins, reception and the doctor concerned.</p>
      </div>
    )
  }
  // Server action scopes the list: a doctor only receives their own record.
  const doctors = await getAllDoctorsWithAvailability()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Doctor Availability</h1>
        <p className="text-sm text-muted-foreground">Manage weekly schedules and leave for each doctor.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {doctors.map((doctor) => (
          <DoctorAvailabilityCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </div>
  )
}
