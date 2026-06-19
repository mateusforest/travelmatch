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
} from "lucide-react"
import { PageHeader, SectionCard, StatCard } from "@/components/agencia/ui-bits"
import { RankingList, CosInsights } from "@/components/master/master-bits"
import { AnalyticsChart } from "@/components/master/analytics-chart"
import { getMasterCommercialAnalyticsData } from "@/lib/data/master"

export default async function MasterAnalyticsPage() {
  const analytics = await getMasterCommercialAnalyticsData()
  const indicators = [
    { icon: Users, label: "Visitantes", value: String(analytics.indicators.visitors), hint: "Total" },
    { icon: Activity, label: "SessÃµes", value: String(analytics.indicators.sessions), hint: "Views reais" },
    { icon: MousePointerClick, label: "Cliques", value: String(analytics.indicators.clicks), hint: "Eventos CTA" },
    { icon: Inbox, label: "Leads", value: String(analytics.indicators.leads), hint: "Acumulado" },
    { icon: Percent, label: "ConversÃµes", value: analytics.indicators.conversionRate, hint: "Taxa media" },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Analytics"
        description="Painel executivo de desempenho e inteligÃªncia de mercado."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {indicators.map((i) => (
          <StatCard key={i.label} {...i} />
        ))}
      </div>

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

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard title="Eventos por tipo" action={<Tag className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={analytics.eventsByType} />
        </SectionCard>
        <SectionCard title="Leads por origem" action={<MapPin className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={analytics.leadsBySource} />
        </SectionCard>
        <SectionCard title="Pacotes mais clicados" action={<Sparkle className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={analytics.topClickedPackages} />
        </SectionCard>
        <SectionCard title="AgÃªncias por conversao" action={<Building2 className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={analytics.agenciesByConversion} />
        </SectionCard>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">InteligÃªncia de mercado</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="grid grid-cols-1 gap-6 lg:col-span-3 sm:grid-cols-2">
            <SectionCard title="Pacotes com mais leads">
              <RankingList items={analytics.topLeadPackages} />
            </SectionCard>
            <SectionCard title="Paginas com maior conversao">
              <RankingList items={analytics.pagesByConversion} />
            </SectionCard>
          </div>
          <div className="lg:col-span-2">
            <CosInsights items={[]} />
          </div>
        </div>
      </div>
    </div>
  )
}
