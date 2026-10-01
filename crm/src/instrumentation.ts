// Slot generation, queue days and print dates all rely on the server's local time.
// Vercel runs in UTC, which would shift every OPD slot by 5h30m, so pin the hospital's timezone.
export function register() {
  process.env.TZ = process.env.APP_TZ || "Asia/Kolkata"
}
