"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bell, Menu, Sparkles, X } from "lucide-react"
import { MasterNav } from "@/components/master/master-nav"
import { CosMasterField } from "@/components/master/cos-master-field"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function MasterShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cosOpen, setCosOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/40 lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <Link href="/" aria-label="TravelMatch - Início" className="flex items-center gap-2">
            <Image
              src="/travelmatch-logo.png"
              alt="TravelMatch"
              width={396}
              height={90}
              priority
              className="h-7 w-auto"
            />
          </Link>
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Master
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <MasterNav />
        </div>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                M
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                Administração
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Acesso Master
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/travelmatch-logo.png"
                  alt="TravelMatch"
                  width={396}
                  height={90}
                  className="h-7 w-auto"
                />
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Master
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <MasterNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* COS field - desktop */}
            <div className="hidden max-w-xl flex-1 md:block">
              <CosMasterField compact />
            </div>
            <div className="flex-1 md:hidden" />

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setCosOpen(true)}
                aria-label="Fale com o COS"
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <Avatar className="ml-1 h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  M
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* COS field - mobile expanded */}
          {cosOpen && (
            <div className="border-t border-border px-4 py-3 md:hidden">
              <CosMasterField compact />
              <button
                onClick={() => setCosOpen(false)}
                className="mt-2 text-xs text-muted-foreground"
              >
                Fechar
              </button>
            </div>
          )}
        </header>

        <main className="px-4 py-8 lg:px-8 lg:py-10">{children}</main>
      </div>

      {/* Floating COS button */}
      <button
        onClick={() => setCosOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95 md:hidden"
        aria-label="Fale com o COS"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    </div>
  )
}
