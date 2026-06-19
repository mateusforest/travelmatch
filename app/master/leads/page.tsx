import { Inbox, CheckCircle2, Percent, Building2, Package, MapPin } from "lucide-react"
import { PageHeader, SectionCard, StatCard } from "@/components/agencia/ui-bits"
import { RankingList } from "@/components/master/master-bits"

// Plataforma 0km: indicadores zerados e rankings vazios até haver dados reais.
const metrics = [
  { icon: Inbox, label: "Leads totais", value: "0", hint: "Acumulado da plataforma" },
  { icon: CheckCircle2, label: "Leads convertidos", value: "0", hint: "Negócios fechados" },
  { icon: Percent, label: "Taxa média de conversão", value: "—", hint: "Sem dados ainda" },
]

const topAgencies: { name: string; value: string; meta?: string }[] = []

const topPackages: { name: string; value: string }[] = []

const topDestinations: { name: string; value: string }[] = []

export default function MasterLeadsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Leads"
        description="Visão global da geração de oportunidades no marketplace."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <StatCard key={m.label} {...m} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Agências com mais leads"
          action={<Building2 className="h-4 w-4 text-muted-foreground" />}
        >
          <RankingList items={topAgencies} />
        </SectionCard>
        <SectionCard
          title="Pacotes com mais leads"
          action={<Package className="h-4 w-4 text-muted-foreground" />}
        >
          <RankingList items={topPackages} />
        </SectionCard>
        <SectionCard
          title="Destinos mais procurados"
          action={<MapPin className="h-4 w-4 text-muted-foreground" />}
        >
          <RankingList items={topDestinations} />
        </SectionCard>
      </div>
    </div>
  )
}
