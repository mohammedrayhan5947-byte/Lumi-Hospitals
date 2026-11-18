"use client"

import { SCOPES, ROLE_DEFAULTS } from "@/lib/permissions"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

const GROUPS = Array.from(new Set(SCOPES.map((s) => s.group)))

export function ScopePicker({
  role,
  useDefaults,
  onUseDefaultsChange,
  value,
  onChange,
}: {
  role: string
  useDefaults: boolean
  onUseDefaultsChange: (v: boolean) => void
  value: string[]
  onChange: (v: string[]) => void
}) {
  if (role === "ADMIN") {
    return <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">Admins always have access to every section.</p>
  }
  const toggle = (key: string, on: boolean) => onChange(on ? [...value, key] : value.filter((k) => k !== key))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
        <label htmlFor="use-role-defaults" className="text-sm font-medium">
          Use role defaults
          <span className="block text-xs font-normal text-muted-foreground">
            {(ROLE_DEFAULTS[role] ?? []).length} sections for this role
          </span>
        </label>
        <Switch
          id="use-role-defaults"
          checked={useDefaults}
          onCheckedChange={(v) => {
            onUseDefaultsChange(v)
            if (!v && value.length === 0) onChange([...(ROLE_DEFAULTS[role] ?? [])])
          }}
        />
      </div>

      {!useDefaults && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{value.length} of {SCOPES.length} selected</span>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(SCOPES.map((s) => s.key))}>Select all</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>Clear</Button>
            </div>
          </div>
          {GROUPS.map((g) => (
            <fieldset key={g} className="space-y-1.5">
              <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g}</legend>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {SCOPES.filter((s) => s.group === g).map((s) => (
                  <label key={s.key} className="flex items-start gap-2 rounded-md border px-2.5 py-2 text-sm hover:bg-muted/50">
                    <Checkbox
                      className="mt-0.5"
                      checked={value.includes(s.key)}
                      onCheckedChange={(c) => toggle(s.key, !!c)}
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {value.length === 0 && (
            <p className="text-xs text-amber-600">No sections selected: the role defaults will apply.</p>
          )}
        </div>
      )}
    </div>
  )
}
