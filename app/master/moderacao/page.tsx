"use client"

import { useState } from "react"
import {
  Building2,
  Package,
  Flag,
  UserX,
  CheckCircle2,
  XCircle,
  MessageSquareWarning,
} from "lucide-react"
import { PageHeader } from "@/components/agencia/ui-bits"
import { Button } from "@/components/ui/button"

type Item = { title: string; desc: string; when: string }

// Plataforma 0km: filas de moderação vazias até a chegada de cadastros e publicações reais.
const queues: { key: string; label: string; icon: typeof Building2; items: Item[] }[] = [
  { key: "agencias", label: "Agências pendentes", icon: Building2, items: [] },
  { key: "pacotes", label: "Pacotes pendentes", icon: Package, items: [] },
  { key: "denuncias", label: "Conteúdo denunciado", icon: Flag, items: [] },
  { key: "perfis", label: "Perfis incompletos", icon: UserX, items: [] },
]

export default function MasterModeracaoPage() {
  const [active, setActive] = useState("agencias")
  const current = queues.find((q) => q.key === active)!

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Moderação"
        description="Centro de qualidade e aprovação da plataforma."
      />

      {/* Queue tabs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {queues.map((q) => (
          <button
            key={q.key}
            onClick={() => setActive(q.key)}
            className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors ${
              active === q.key
                ? "border-primary bg-primary/[0.04]"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10">
              <q.icon className="h-[18px] w-[18px] text-primary" />
            </span>
            <span className="text-sm font-medium text-foreground">{q.label}</span>
            <span className="text-xs text-muted-foreground">{q.items.length} na fila</span>
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03]">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{current.label}</h2>
        </div>
        {current.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </span>
            <p className="text-sm font-medium text-foreground">Fila vazia</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Nenhum item aguardando moderação nesta categoria no momento.
            </p>
          </div>
        ) : (
        <ul className="divide-y divide-border">
          {current.items.map((item, i) => (
            <li key={i} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.when}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Aprovar
                </Button>
                <Button size="sm" variant="outline" className="rounded-lg">
                  <MessageSquareWarning className="mr-1.5 h-4 w-4" /> Solicitar ajuste
                </Button>
                <Button size="sm" variant="ghost" className="rounded-lg text-red-600 hover:text-red-600">
                  <XCircle className="mr-1.5 h-4 w-4" /> Rejeitar
                </Button>
              </div>
            </li>
          ))}
        </ul>
        )}
      </div>
    </div>
  )
}
