import {
  Users,
  MousePointerClick,
  Activity,
  Inbox,
  Percent,
  MapPin,
  Tag,
  Sparkle,
  Building2,
  Package,
  TrendingUp,
  Snowflake,
  Plane,
} from "lucide-react"
import { PageHeader, SectionCard, StatCard } from "@/components/agencia/ui-bits"
import { RankingList, CosInsights } from "@/components/master/master-bits"
import { AnalyticsChart } from "@/components/master/analytics-chart"

// Plataforma 0km: indicadores zerados, rankings e inteligência vazios até haver dados reais.
const indicators = [
  { icon: Users, label: "Visitantes", value: "0", hint: "Últimos 30 dias" },
  { icon: Activity, label: "Sessões", value: "0", hint: "Últimos 30 dias" },
  { icon: MousePointerClick, label: "Cliques", value: "0", hint: "Últimos 30 dias" },
  { icon: Inbox, label: "Leads", value: "0", hint: "Acumulado" },
  { icon: Percent, label: "Conversões", value: "—", hint: "Taxa média" },
]

const destinations: { name: string; value: string }[] = []

const categories: { name: string; value: string }[] = []

const specialties: { name: string; value: string }[] = []

const agencies: { name: string; value: string }[] = []

const trends: { icon: typeof Plane; title: string; desc: string; delta: string }[] = []

const cosItems: { text: string; trend?: string }[] = []

export default function MasterAnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Analytics"
        description="Painel executivo de desempenho e inteligência de mercado."
      />

      {/* Indicators */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {indicators.map((i) => (
          <StatCard key={i.label} {...i} />
        ))}
      </div>

      {/* Chart */}
      <div className="mt-6">
        <SectionCard
          title="Visitantes e leads"
          action={
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Visitantes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-foreground" /> Leads
              </span>
            </div>
          }
        >
          <AnalyticsChart />
        </SectionCard>
      </div>

      {/* Rankings */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard title="Destinos mais buscados" action={<MapPin className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={destinations} />
        </SectionCard>
        <SectionCard title="Categorias mais buscadas" action={<Tag className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={categories} />
        </SectionCard>
        <SectionCard title="Especialidades mais buscadas" action={<Sparkle className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={specialties} />
        </SectionCard>
        <SectionCard title="Agências mais acessadas" action={<Building2 className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={agencies} />
        </SectionCard>
      </div>

      {/* Market intelligence */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Inteligência de mercado</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {trends.length === 0 ? (
              <div className="flex h-full min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 p-6 text-center">
                <p className="text-sm font-medium text-foreground">Sem tendências ainda</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  As tendências de mercado serão calculadas conforme as buscas e leads forem registrados.
                </p>
              </div>
            ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {trends.map((t) => (
                <div
                  key={t.title}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-black/[0.03]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                      <t.icon className="h-5 w-5 text-primary" />
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                      {t.delta}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                </div>
              ))}
            </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <CosInsights items={cosItems} />
          </div>
        </div>
      </div>
    </div>
  )
}
