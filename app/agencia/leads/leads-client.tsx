"use client"

import { useState } from "react"
import { Inbox } from "lucide-react"
import { EmptyState } from "@/components/agencia/ui-bits"
import type { AgencyLead } from "@/lib/data/agency"

const statusFilters = [
  "Todos",
  "Novo",
  "Em contato",
  "Proposta enviada",
  "Convertido",
  "Perdido",
] as const

export function LeadsClient({ leads }: { leads: AgencyLead[] }) {
  const [active, setActive] = useState<(typeof statusFilters)[number]>("Todos")

  const filtered =
    active === "Todos" ? leads : leads.filter((l) => l.status === active)

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active === s
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03]">
          <EmptyState
            icon={Inbox}
            title="Nenhum lead por aqui"
            description="Quando um viajante demonstrar interesse em um pacote compatível, o lead aparecerá aqui para você responder."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </>
  )
}

const statusStyles: Record<AgencyLead["status"], string> = {
  Novo: "bg-primary/10 text-primary border-primary/20",
  "Em contato": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Proposta enviada": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Convertido: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Perdido: "bg-secondary text-muted-foreground border-border",
}

function LeadCard({ lead }: { lead: AgencyLead }) {
  return (
    <button className="flex flex-col rounded-2xl border border-border bg-card p-5 text-left shadow-sm shadow-black/[0.03] transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{lead.name}</h3>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[lead.status]}`}
        >
          {lead.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{lead.interest}</p>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{lead.date}</span>
        <span className="font-medium text-primary">{lead.match}% match</span>
      </div>
    </button>
  )
}
