export default function Loading() {
  return (
    <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
    </div>
  )
}
