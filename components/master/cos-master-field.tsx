"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUp, Sparkles } from "lucide-react"

const suggestions = [
  { label: "Agências", href: "/master/agencias" },
  { label: "Leads", href: "/master/leads" },
  { label: "Analytics", href: "/master/analytics" },
  { label: "Pacotes", href: "/master/pacotes" },
  { label: "Financeiro", href: "/master/financeiro" },
  { label: "Moderação", href: "/master/moderacao" },
  { label: "Configurações", href: "/master/configuracoes" },
  { label: "Ver desempenho", href: "/master/analytics" },
]

export function CosMasterField({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative w-full">
      <form
        onSubmit={(event) => event.preventDefault()}
        className={`group relative flex items-center gap-2 rounded-full border bg-card transition-all duration-300 ${
          focused
            ? "border-primary/50 shadow-lg shadow-primary/10 ring-2 ring-primary/10"
            : "border-border shadow-sm shadow-black/[0.03] hover:border-border/80"
        } ${compact ? "h-10 pl-3 pr-1.5" : "h-12 pl-4 pr-2"}`}
      >
        <Sparkles
          className={`shrink-0 text-primary ${compact ? "h-4 w-4" : "h-[18px] w-[18px]"}`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Fale com o COS"
          aria-label="Fale com o COS"
          className={`flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/80 focus:outline-none ${
            compact ? "text-sm" : "text-[15px]"
          }`}
        />
        <button
          type="submit"
          aria-label="Enviar para o COS"
          className={`grid shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 ${
            compact ? "h-7 w-7" : "h-8 w-8"
          }`}
        >
          <ArrowUp className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      </form>

      {focused && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-border bg-popover p-2 shadow-lg">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {suggestions.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setValue(item.label)}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
