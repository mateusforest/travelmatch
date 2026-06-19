"use client"

import { useState } from "react"
import { Building2, User, Wrench, CreditCard, Clock } from "lucide-react"
import { PageHeader, StatCard } from "@/components/agencia/ui-bits"
import { Inbox, CheckCircle2, Timer } from "lucide-react"

// Plataforma 0km: métricas zeradas e fila de tickets vazia.
const metrics = [
  { icon: Inbox, label: "Tickets abertos", value: "0", hint: "Aguardando resposta" },
  { icon: Timer, label: "Tempo médio", value: "—", hint: "Primeira resposta" },
  { icon: CheckCircle2, label: "Resolvidos (7d)", value: "0", hint: "Últimos 7 dias" },
]

const filters = [
  { key: "todos", label: "Todos" },
  { key: "agencias", label: "Agências" },
  { key: "viajantes", label: "Viajantes" },
  { key: "tecnicos", label: "Problemas técnicos" },
  { key: "financeiro", label: "Financeiro" },
]

type Ticket = {
  id: string
  subject: string
  from: string
  type: string
  icon: typeof Building2
  priority: string
  when: string
}

const tickets: Ticket[] = []

const priorityStyle: Record<string, string> = {
  Alta: "bg-red-500/10 text-red-600",
  Média: "bg-amber-500/10 text-amber-600",
  Baixa: "bg-secondary text-muted-foreground",
}

export default function MasterSuportePage() {
  const [active, setActive] = useState("todos")
  const filtered = active === "todos" ? tickets : tickets.filter((t) => t.type === active)

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Suporte"
        description="Central única de atendimento da plataforma."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <StatCard key={m.label} {...m} />
        ))}
      </div>

      <div className="mt-6 mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
              active === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
              <Inbox className="h-6 w-6 text-primary" />
            </span>
            <p className="text-sm font-medium text-foreground">Nenhum ticket por aqui</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Solicitações de agências e viajantes aparecerão nesta central de atendimento.
            </p>
          </div>
        ) : (
        <ul className="divide-y divide-border">
          {filtered.map((t) => (
            <li key={t.id} className="flex items-center gap-4 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                <t.icon className="h-5 w-5 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{t.id}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${priorityStyle[t.priority]}`}>
                    {t.priority}
                  </span>
                </div>
                <p className="truncate font-medium text-foreground">{t.subject}</p>
                <p className="truncate text-xs text-muted-foreground">{t.from}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {t.when}
              </span>
            </li>
          ))}
        </ul>
        )}
      </div>
    </div>
  )
}
