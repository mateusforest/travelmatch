import {
  Eye,
  MousePointerClick,
  Inbox,
  TrendingUp,
  Sparkles,
  LineChart,
} from "lucide-react"
import { PageHeader, SectionCard, StatCard } from "@/components/agencia/ui-bits"
import { RankingList } from "@/components/master/master-bits"
import { getAgencyAnalyticsData } from "@/lib/data/agency"

export default async function AnalyticsPage() {
  const analytics = await getAgencyAnalyticsData()
  const stats = [
    { icon: Eye, label: "VisualizaÃ§Ãµes", value: String(analytics.stats.views), hint: "total" },
    { icon: MousePointerClick, label: "Cliques", value: String(analytics.stats.clicks), hint: "eventos CTA" },
    { icon: Inbox, label: "Leads", value: String(analytics.stats.leads), hint: "total" },
    { icon: TrendingUp, label: "ConversÃµes", value: String(analytics.stats.conversions), hint: "ganhos" },
  ]

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Entenda como sua agÃªncia estÃ¡ performando no TravelMatch."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Eventos por CTA" action={<LineChart className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={analytics.ctaEvents} />
        </SectionCard>
        <SectionCard title="Origem dos leads" action={<LineChart className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={analytics.leadSources} />
        </SectionCard>
        <SectionCard title="Pacotes mais clicados" action={<LineChart className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={analytics.topClickedPackages} />
        </SectionCard>
        <SectionCard title="Pacotes com mais leads" action={<LineChart className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={analytics.topLeadPackages} />
        </SectionCard>
        <SectionCard title="Conversao por pagina" action={<LineChart className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={analytics.conversionsByPage} />
        </SectionCard>
        <SectionCard title="Leads por status" action={<LineChart className="h-4 w-4 text-muted-foreground" />}>
          <RankingList items={analytics.leadsByStatus} />
        </SectionCard>
      </div>

      <section className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.06] to-card p-5 shadow-sm shadow-black/[0.03]">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15">
            <Sparkles className="h-[18px] w-[18px] text-primary" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">Insights do COS</h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              Conforme os dados reais evoluirem, os principais sinais comerciais aparecem acima.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
