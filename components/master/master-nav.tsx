"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Package,
  Inbox,
  BarChart3,
  Wallet,
  ShieldCheck,
  LifeBuoy,
  Settings,
} from "lucide-react"

export const masterNavItems = [
  { label: "Overview", href: "/master", icon: LayoutDashboard },
  { label: "Agências", href: "/master/agencias", icon: Building2 },
  { label: "Pacotes", href: "/master/pacotes", icon: Package },
  { label: "Leads", href: "/master/leads", icon: Inbox },
  { label: "Analytics", href: "/master/analytics", icon: BarChart3 },
  { label: "Financeiro", href: "/master/financeiro", icon: Wallet },
  { label: "Moderação", href: "/master/moderacao", icon: ShieldCheck },
  { label: "Suporte", href: "/master/suporte", icon: LifeBuoy },
  { label: "Configurações", href: "/master/configuracoes", icon: Settings },
]

export function MasterNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {masterNavItems.map((item) => {
        const active =
          item.href === "/master"
            ? pathname === "/master"
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
