"use client"

import { useState, useTransition } from "react"
import { addAgencyLeadTimelineEvent, updateAgencyLead } from "@/app/actions/leads"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AgencyLeadDetails } from "@/lib/data/agency"

const statusOptions = [
  { label: "Novo", value: "new" },
  { label: "Em contato", value: "contacted" },
  { label: "Proposta enviada", value: "proposal_sent" },
  { label: "Ganho", value: "won" },
  { label: "Perdido", value: "lost" },
  { label: "Arquivado", value: "archived" },
] as const

export function LeadDetailClient({ lead }: { lead: AgencyLeadDetails }) {
  const [status, setStatus] = useState(lead.statusValue)
  const [notes, setNotes] = useState(lead.notes)
  const [manualTitle, setManualTitle] = useState("")
  const [manualDescription, setManualDescription] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const saveLead = () => {
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

  const addEvent = () => {
    setFeedback(null)
    startTransition(async () => {
      const result = await addAgencyLeadTimelineEvent(lead.id, {
        title: manualTitle,
        description: manualDescription,
      })
      if (result.ok) {
        setManualTitle("")
        setManualDescription("")
        setFeedback("Evento registrado.")
      } else {
        setFeedback(result.message ?? "Nao foi possivel registrar.")
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-black/[0.03]">
        <h2 className="text-lg font-semibold text-foreground">{lead.name}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <p><span className="font-medium text-foreground">E-mail:</span> {lead.email}</p>
          <p><span className="font-medium text-foreground">Telefone:</span> {lead.phone}</p>
          <p><span className="font-medium text-foreground">Pacote:</span> {lead.packageTitle}</p>
          <p><span className="font-medium text-foreground">Agencia:</span> {lead.agencyName}</p>
          <p><span className="font-medium text-foreground">Origem:</span> {lead.source}</p>
          <p><span className="font-medium text-foreground">CTA:</span> {lead.ctaLabel}</p>
          <p><span className="font-medium text-foreground">Pagina:</span> {lead.sourcePage}</p>
          <p><span className="font-medium text-foreground">Prioridade:</span> {lead.priority}</p>
          <p><span className="font-medium text-foreground">Score:</span> {lead.match}</p>
          <p><span className="font-medium text-foreground">Orcamento:</span> {lead.budgetRange}</p>
          <p><span className="font-medium text-foreground">Data:</span> {lead.travelDate}</p>
          <p><span className="font-medium text-foreground">Viajantes:</span> {lead.travelersCount ?? "Nao informado"}</p>
        </div>
        <p className="mt-4 rounded-xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
          {lead.message}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as AgencyLeadDetails["statusValue"])}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Button onClick={saveLead} disabled={pending} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            Salvar lead
          </Button>
        </div>
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-3 min-h-28 resize-none"
          placeholder="Anotacoes internas"
        />
        {feedback && <p className="mt-3 text-sm text-muted-foreground">{feedback}</p>}
      </section>

      <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-black/[0.03]">
        <h2 className="text-base font-semibold text-foreground">Timeline</h2>
        <div className="mt-4 flex flex-col gap-3">
          {lead.timeline.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
              Sem eventos registrados.
            </p>
          ) : (
            lead.timeline.map((event) => (
              <div key={event.id} className="rounded-xl border border-border bg-background/60 p-3">
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.date}</p>
                {event.description && <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>}
              </div>
            ))
          )}
        </div>
        <div className="mt-5 border-t border-border pt-4">
          <Input
            value={manualTitle}
            onChange={(event) => setManualTitle(event.target.value)}
            placeholder="Titulo do evento"
            className="h-10 rounded-xl"
          />
          <Textarea
            value={manualDescription}
            onChange={(event) => setManualDescription(event.target.value)}
            placeholder="Descricao"
            className="mt-2 min-h-20 resize-none rounded-xl"
          />
          <Button onClick={addEvent} disabled={pending} className="mt-3 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            Registrar evento
          </Button>
        </div>
      </aside>
    </div>
  )
}
