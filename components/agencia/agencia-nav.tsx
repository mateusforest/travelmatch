"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Inbox,
  Store,
  BarChart3,
  CreditCard,
  Settings,
} from "lucide-react"

export const navItems = [
  { label: "Dashboard", href: "/agencia", icon: LayoutDashboard },
  { label: "Pacotes", href: "/agencia/pacotes", icon: Package },
  { label: "Leads", href: "/agencia/leads", icon: Inbox },
  { label: "Perfil Público", href: "/agencia/perfil", icon: Store },
  { label: "Analytics", href: "/agencia/analytics", icon: BarChart3 },
  { label: "Assinatura", href: "/agencia/assinatura", icon: CreditCard },
  { label: "Configurações", href: "/agencia/configuracoes", icon: Settings },
]

export function AgenciaNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active =
          item.href === "/agencia"
            ? pathname === "/agencia"
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon
              className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
