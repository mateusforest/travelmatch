"use client"

import Link from "next/link"
import { Bell, CreditCard, LogOut, Settings, Shield, User } from "lucide-react"
import { signOutUser } from "@/app/actions/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TopbarNotification } from "@/lib/data/topbar"

type PortalKind = "agency" | "master"

type TopbarActionsProps = {
  portal: PortalKind
  fallback: string
  email: string
  notifications: TopbarNotification[]
}

function routesFor(portal: PortalKind) {
  if (portal === "master") {
    return {
      profile: "/master/configuracoes",
      settings: "/master/configuracoes",
      plans: "/master/financeiro",
      invoice: "/master/financeiro",
      security: "/master/configuracoes",
    }
  }

  return {
    profile: "/agencia/perfil",
    settings: "/agencia/configuracoes",
    plans: "/agencia/assinatura",
    invoice: "/agencia/assinatura",
    security: "/agencia/configuracoes",
  }
}

export function TopbarActions({ portal, fallback, email, notifications }: TopbarActionsProps) {
  const routes = routesFor(portal)
  const hasNotifications = notifications.length > 0

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notificações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {hasNotifications ? (
            notifications.map((notification) => (
              <DropdownMenuItem key={`${notification.title}-${notification.href}`} asChild>
                <Link href={notification.href} className="flex flex-col items-start gap-0.5 whitespace-normal">
                  <span className="text-sm font-medium text-foreground">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">{notification.description}</span>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label="Meu perfil" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {fallback}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>
            <span className="block text-sm">Meu perfil</span>
            {email && (
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {email}
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={routes.profile}>
              <User className="h-4 w-4" />
              Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={routes.settings}>
              <Settings className="h-4 w-4" />
              Configurações da conta
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={routes.plans}>
              <CreditCard className="h-4 w-4" />
              Planos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={routes.invoice}>
              <CreditCard className="h-4 w-4" />
              Fatura
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={routes.security}>
              <Shield className="h-4 w-4" />
              Segurança
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={signOutUser}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
