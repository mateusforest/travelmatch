"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  Building2,
  MapPin,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  PauseCircle,
  Archive,
  Package,
  Inbox,
  CheckCircle2,
} from "lucide-react"
import { EmptyState } from "@/components/agencia/ui-bits"
import { HealthScoreBadge, scoreLabel } from "@/components/master/master-bits"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { MasterAgency } from "@/lib/data/master"
import { setAgencyStatus, updateAgencyFeatureSettings } from "@/app/actions/master"

const plans = ["Todos os planos", "Essencial", "Performance"]

export function MasterAgenciasClient({ agencies }: { agencies: MasterAgency[] }) {
  const [query, setQuery] = useState("")
  const [plan, setPlan] = useState("Todos os planos")
  const [pending, startTransition] = useTransition()

  const filtered = agencies.filter((a) => {
    const matchesQuery =
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.specialty.toLowerCase().includes(query.toLowerCase()) ||
      a.city.toLowerCase().includes(query.toLowerCase())
    const matchesPlan = plan === "Todos os planos" || a.plan === plan
    return matchesQuery && matchesPlan
  })

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, cidade ou especialidade"
            className="h-11 rounded-xl pl-9"
          />
        </div>
        <div className="flex gap-2">
          {plans.map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                plan === p
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03]">
          <EmptyState
            icon={Building2}
            title="Nenhuma agência cadastrada"
            description="Quando agências se cadastrarem na plataforma, elas aparecerão aqui com seu Health Score, planos e métricas."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <div
              key={a.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm shadow-black/[0.03] transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">{a.name}</h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {a.city}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ações">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild disabled={!a.slug}>
                      <Link href={a.slug ? `/agencias/${a.slug}` : "/master/agencias"}>
                        <Eye className="mr-2 h-4 w-4" /> Visualizar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault()
                        startTransition(() => {
                          void setAgencyStatus(a.id, "active")
                        })
                      }}
                      disabled={pending}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault()
                        startTransition(() => {
                          void setAgencyStatus(a.id, "suspended")
                        })
                      }}
                      disabled={pending}
                    >
                      <PauseCircle className="mr-2 h-4 w-4" /> Suspender
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                      <Archive className="mr-2 h-4 w-4" /> Arquivar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                  {a.specialty}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    a.plan === "Performance"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  Plano {a.plan}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.packages}</p>
                    <p className="text-xs text-muted-foreground">pacotes ativos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.leads}</p>
                    <p className="text-xs text-muted-foreground">leads recebidos</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Health Score</p>
                  <p className="text-xs text-muted-foreground">{scoreLabel(a.score)}</p>
                </div>
                <HealthScoreBadge score={a.score} />
              </div>

              <FeatureControls agency={a} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function FeatureControls({ agency }: { agency: MasterAgency }) {
  const [order, setOrder] = useState(agency.featureManualOrder?.toString() ?? "")
  const [label, setLabel] = useState(agency.featureEditorialLabel)
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(agency.featureStartsAt))
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(agency.featureEndsAt))
  const [pending, startTransition] = useTransition()

  const save = (input: Parameters<typeof updateAgencyFeatureSettings>[1]) => {
    startTransition(() => {
      void updateAgencyFeatureSettings(agency.id, input)
    })
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-background/60 p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{agency.featurePinned ? "Fixada" : "Auto"}</span>
        <span>{agency.featureHidden ? "Oculta" : "Visivel"}</span>
        <span>Score destaque: {agency.score}</span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          value={order}
          onChange={(event) => setOrder(event.target.value)}
          placeholder="Ordem"
          type="number"
          className="h-9 rounded-lg text-xs"
        />
        <Input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Label editorial"
          className="h-9 rounded-lg text-xs"
        />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
          type="datetime-local"
          className="h-9 rounded-lg text-xs"
        />
        <Input
          value={endsAt}
          onChange={(event) => setEndsAt(event.target.value)}
          type="datetime-local"
          className="h-9 rounded-lg text-xs"
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        {agency.scoreBreakdown.map((item) => (
          <div key={item.label} className="flex justify-between gap-2 rounded-md bg-secondary/40 px-2 py-1">
            <span>{item.label}</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          className="h-8 rounded-full text-xs"
          onClick={() => save({ pinned: !agency.featurePinned })}
        >
          {agency.featurePinned ? "Remover fixacao" : "Fixar destaque"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          className="h-8 rounded-full text-xs"
          onClick={() => save({ hidden: !agency.featureHidden })}
        >
          {agency.featureHidden ? "Reexibir" : "Ocultar"}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={pending}
          className="h-8 rounded-full text-xs"
          onClick={() =>
            save({
              manual_order: order ? Number(order) : null,
              editorial_label: label,
              starts_at: startsAt ? new Date(startsAt).toISOString() : null,
              ends_at: endsAt ? new Date(endsAt).toISOString() : null,
            })
          }
        >
          Salvar destaque
        </Button>
      </div>
    </div>
  )
}

function toDatetimeLocal(value: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 16)
}
