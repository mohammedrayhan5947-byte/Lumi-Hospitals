import { getTodayQueue, getTodayTokens } from "@/actions/appointments"
import { getDoctors, getCurrentUser } from "@/lib/auth"
import { QueueBoard } from "@/components/appointments/queue-board"
import { TokenRegister } from "@/components/appointments/token-register"
import { WalkInDialog } from "@/components/appointments/walk-in-dialog"

export default async function QueuePage() {
  const me = await getCurrentUser()
  const [queue, allDoctors, tokens] = await Promise.all([getTodayQueue(), getDoctors(), getTodayTokens()])
  const isDoctor = me.role === "DOCTOR"
  const doctors = isDoctor ? allDoctors.filter((d) => d.id === me.id) : allDoctors

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isDoctor ? "My Queue" : "Today's Queue"}</h1>
          <p className="text-sm text-muted-foreground">{isDoctor ? "Your patients by token, in order." : "Live token board. Each doctor has their own token numbers."}</p>
        </div>
        {!isDoctor && <WalkInDialog doctors={doctors} />}
      </div>

      <QueueBoard queue={queue} doctors={doctors} />

      <TokenRegister tokens={tokens} />
    </div>
  )
}
