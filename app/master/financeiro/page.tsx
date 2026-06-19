import {
  DollarSign,
  TrendingUp,
  Building2,
  Layers,
  CheckCircle2,
} from "lucide-react"
import { PageHeader, SectionCard, StatCard } from "@/components/agencia/ui-bits"
import { RankingList } from "@/components/master/master-bits"
import { getMasterFinanceData } from "@/lib/data/billing"

export default async function MasterFinanceiroPage() {
  const finance = await getMasterFinanceData()
  const indicators = [
    { icon: DollarSign, label: "MRR", value: finance.mrr, hint: "Receita recorrente mensal" },
    { icon: TrendingUp, label: "ARR", value: finance.arr, hint: "Receita recorrente anual" },
    { icon: Building2, label: "Assinaturas ativas", value: String(finance.activeSubscriptions), hint: "Agencias" },
    { icon: Layers, label: "Promocoes ativas", value: String(finance.activePromotions), hint: finance.sponsoredRevenue },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Financeiro"
        description="Receita e saÃºde financeira da plataforma."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {indicators.map((i) => (
          <StatCard key={i.label} {...i} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionCard title="Receita por plano">
            <RankingList items={finance.revenueByPlan} />
          </SectionCard>
        </div>
        <div className="lg:col-span-3">
          <SectionCard title="HistÃ³rico recente">
            {finance.history.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground">
                Nenhuma transaÃ§Ã£o registrada ainda.
              </p>
            ) : (
              <ul className="flex flex-col">
                {finance.history.map((item, i) => (
                  <li
                    key={`${item.title}-${i}`}
                    className="flex items-center gap-3 border-b border-border py-3 last:border-0 last:pb-0 first:pt-0"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.when}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
