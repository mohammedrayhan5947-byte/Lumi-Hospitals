"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Menu } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { NavPanel } from "@/components/layout/sidebar-nav"
import { initials } from "@/lib/format"
import { logout } from "@/actions/auth"

export function Header({ user }: { user: { name: string; role: string } }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="flex h-16 items-center gap-2 border-b bg-background px-3 sm:gap-4 sm:px-4 lg:px-6">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-muted lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <SheetContent side="left" className="w-72 max-w-[85vw] gap-0 p-0 lg:hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <NavPanel role={user.role} onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, UHID, phone…"
            className="pl-9"
          />
        </div>
      </form>

      <Button
        size="sm"
        className="gap-1.5"
        nativeButton={false}
        render={
          <Link href="/patients/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Patient</span>
            <span className="sr-only sm:hidden">New Patient</span>
          </Link>
        }
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button className="flex items-center gap-2 rounded-full outline-none">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs font-normal text-muted-foreground">{user.role.replace("_", " ")}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Account settings</DropdownMenuItem>
          <DropdownMenuItem onClick={() => logout()} className="text-destructive">
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
