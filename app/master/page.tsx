import {
  Building2,
  CheckCircle2,
  Package,
  Inbox,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react"
import { TrendStat, CosInsights } from "@/components/master/master-bits"
import { PageHeader, SectionCard, EmptyState } from "@/components/agencia/ui-bits"
import { getMasterOverviewData } from "@/lib/data/master"

const activities: { who: string; what: string; when: string; tag: string }[] = []

const cosItems: { text: string; trend?: string }[] = []

export default async function MasterOverviewPage() {
  const overview = await getMasterOverviewData()
  const kpis = [
    { icon: Building2, label: "Agências cadastradas", value: String(overview.agenciesTotal), delta: undefined, positive: true },
    { icon: CheckCircle2, label: "Agências ativas", value: String(overview.activeAgencies), delta: undefined, positive: true },
    { icon: Package, label: "Pacotes ativos", value: String(overview.activePackages), delta: undefined, positive: true },
    { icon: Inbox, label: "Leads gerados", value: String(overview.leadsTotal), delta: undefined, positive: true },
    { icon: Users, label: "Visitantes", value: "0", delta: undefined, positive: true },
    { icon: DollarSign, label: "Receita mensal", value: "R$ 0", delta: undefined, positive: true },
  ]
  const growth = [
    { label: "Novas agências", value: String(overview.newAgencies), sub: "últimos 30 dias" },
    { label: "Novos pacotes", value: String(overview.newPackages), sub: "últimos 30 dias" },
    { label: "Novos leads", value: String(overview.newLeads), sub: "últimos 30 dias" },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Visão geral da plataforma"
        description="Acompanhe a operação completa do TravelMatch em um único lugar."
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <TrendStat key={k.label} {...k} />
        ))}
      </div>

      {/* Growth */}
      <div className="mt-6">
        <SectionCard title="Crescimento">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {growth.map((g) => (
              <div
                key={g.label}
                className="rounded-xl border border-border bg-secondary/40 p-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {g.label}
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {g.value}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{g.sub}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Activities + COS */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionCard title="Atividades recentes">
            {activities.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Nenhuma atividade ainda"
                description="Cadastros, publicações e leads das agências aparecerão aqui em tempo real."
              />
            ) : (
            <ul className="flex flex-col">
              {activities.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-0 last:pb-0 first:pt-0"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                    {a.who.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      <span className="font-medium">{a.who}</span> {a.what}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.when}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {a.tag}
                  </span>
                </li>
              ))}
            </ul>
            )}
          </SectionCard>
        </div>
        <div className="lg:col-span-2">
          <CosInsights items={cosItems} />
        </div>
      </div>
    </div>
  )
}
