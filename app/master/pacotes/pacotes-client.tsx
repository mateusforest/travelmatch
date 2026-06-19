"use client"

import { useState, useTransition } from "react"
import {
  Search,
  MoreVertical,
  CheckCircle2,
  EyeOff,
  Star,
  Archive,
  Trash2,
  Eye,
  Inbox,
  Package,
} from "lucide-react"
import { EmptyState } from "@/components/agencia/ui-bits"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { MasterPackage } from "@/lib/data/master"
import { setMasterPackageStatus, setPackageFeatured } from "@/app/actions/master"

const statusFilters = ["Todos", "Ativo", "Pendente", "Destaque", "Oculto"]

const statusStyle: Record<string, string> = {
  Ativo: "bg-emerald-500/10 text-emerald-600",
  Pendente: "bg-amber-500/10 text-amber-600",
  Destaque: "bg-primary/10 text-primary",
  Oculto: "bg-secondary text-muted-foreground",
}

export function MasterPacotesClient({ packages }: { packages: MasterPackage[] }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("Todos")
  const [pending, startTransition] = useTransition()

  const filtered = packages.filter((p) => {
    const matchesQuery =
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.agency.toLowerCase().includes(query.toLowerCase()) ||
      p.destination.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === "Todos" || p.status === status
    return matchesQuery && matchesStatus
  })

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, agência ou destino"
            className="h-11 rounded-xl pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                status === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03]">
          <EmptyState
            icon={Package}
            title="Nenhum pacote publicado"
            description="Quando as agências publicarem pacotes, eles aparecerão aqui para moderação e gestão global."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.title}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03] transition-shadow hover:shadow-md"
            >
              <div className="relative flex h-32 items-end bg-gradient-to-br from-primary/15 to-secondary p-4">
                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[p.status]}`}
                >
                  {p.status}
                </span>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{p.destination}</p>
                  <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{p.agency}</span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {p.category}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {p.views.toLocaleString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <Inbox className="h-4 w-4 text-muted-foreground" />
                      {p.leads}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ações">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          startTransition(() => {
                            void setMasterPackageStatus(p.id, "published")
                          })
                        }}
                        disabled={pending}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          startTransition(() => {
                            void setPackageFeatured(p.id, !p.featured)
                          })
                        }}
                        disabled={pending}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        {p.featured ? "Remover destaque" : "Destacar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault()
                          startTransition(() => {
                            void setMasterPackageStatus(p.id, "draft")
                          })
                        }}
                        disabled={pending}
                      >
                        <EyeOff className="mr-2 h-4 w-4" /> Ocultar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Archive className="mr-2 h-4 w-4" /> Arquivar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
