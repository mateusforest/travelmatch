"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Inbox } from "lucide-react"
import { updateAgencyLead } from "@/app/actions/leads"
import { EmptyState } from "@/components/agencia/ui-bits"
import { Textarea } from "@/components/ui/textarea"
import type { AgencyLead } from "@/lib/data/agency"

const statusFilters = [
  "Todos",
  "Novo",
  "Em contato",
  "Proposta enviada",
  "Ganho",
  "Perdido",
  "Arquivado",
] as const

const statusOptions = [
  { label: "Novo", value: "new" },
  { label: "Em contato", value: "contacted" },
  { label: "Proposta enviada", value: "proposal_sent" },
  { label: "Ganho", value: "won" },
  { label: "Perdido", value: "lost" },
  { label: "Arquivado", value: "archived" },
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
  Ganho: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Perdido: "bg-secondary text-muted-foreground border-border",
  Arquivado: "bg-secondary text-muted-foreground border-border",
}

function LeadCard({ lead }: { lead: AgencyLead }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(lead.statusValue)
  const [notes, setNotes] = useState(lead.notes)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const save = () => {
    setFeedback(null)
    startTransition(async () => {
      const result = await updateAgencyLead(lead.id, {
        status,
        notes,
        last_contact_at: new Date().toISOString(),
      })

      setFeedback(result.ok ? "Lead atualizado." : result.message ?? "Nao foi possivel atualizar.")
    })
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 text-left shadow-sm shadow-black/[0.03] transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
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
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-4 text-left text-sm font-medium text-primary hover:underline"
      >
        {open ? "Ocultar detalhe" : "Ver detalhe"}
      </button>
      <Link
        href={`/agencia/leads/${lead.id}`}
        className="mt-2 text-sm font-medium text-primary hover:underline"
      >
        Abrir pagina do lead
      </Link>
      {open && (
        <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
          <div className="grid grid-cols-1 gap-2 text-muted-foreground">
            <p><span className="font-medium text-foreground">E-mail:</span> {lead.email}</p>
            <p><span className="font-medium text-foreground">Telefone:</span> {lead.phone}</p>
            <p><span className="font-medium text-foreground">Pacote:</span> {lead.packageTitle}</p>
            <p><span className="font-medium text-foreground">Origem:</span> {lead.source}</p>
            <p><span className="font-medium text-foreground">Pagina:</span> {lead.sourcePage}</p>
            <p><span className="font-medium text-foreground">CTA:</span> {lead.ctaLabel}</p>
            <p><span className="font-medium text-foreground">Data da viagem:</span> {lead.travelDate}</p>
            <p><span className="font-medium text-foreground">Viajantes:</span> {lead.travelersCount ?? "Nao informado"}</p>
            <p><span className="font-medium text-foreground">Orcamento:</span> {lead.budgetRange}</p>
            <p><span className="font-medium text-foreground">Ultimo contato:</span> {lead.lastContactAt}</p>
            <p><span className="font-medium text-foreground">Mensagem:</span> {lead.message}</p>
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as AgencyLead["statusValue"])}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anotacoes internas"
            className="min-h-24 resize-none"
          />
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            Salvar lead
          </button>
          {feedback && <p className="text-xs text-muted-foreground">{feedback}</p>}
        </div>
      )}
    </div>
  )
}
