import { Building2, CheckCircle2, Inbox, Package, Percent, Rows3 } from "lucide-react"
import { PageHeader, SectionCard, StatCard } from "@/components/agencia/ui-bits"
import { RankingList } from "@/components/master/master-bits"
import { getMasterLeadFunnelData } from "@/lib/data/master"

export default async function MasterLeadsPage() {
  const funnel = await getMasterLeadFunnelData()
  const metrics = [
    { icon: Inbox, label: "Leads totais", value: String(funnel.totalLeads), hint: "Acumulado da plataforma" },
    { icon: CheckCircle2, label: "Leads convertidos", value: String(funnel.wonLeads), hint: "Negocios fechados" },
    { icon: Percent, label: "Taxa media de conversao", value: funnel.conversionRate, hint: "Ganhos/leads" },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Leads"
        description="Visao global da geracao de oportunidades no marketplace."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <StatCard key={m.label} {...m} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Agencias com mais leads"
          action={<Building2 className="h-4 w-4 text-muted-foreground" />}
        >
          <RankingList items={funnel.leadsByAgency} />
        </SectionCard>
        <SectionCard
          title="Pacotes com mais leads"
          action={<Package className="h-4 w-4 text-muted-foreground" />}
        >
          <RankingList items={funnel.leadsByPackage} />
        </SectionCard>
        <SectionCard
          title="Leads por status"
          action={<Rows3 className="h-4 w-4 text-muted-foreground" />}
        >
          <RankingList items={funnel.leadsByStatus} />
        </SectionCard>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Eventos de CTA registrados: {funnel.ctaEventsTotal}
      </p>
    </div>
  )
}
