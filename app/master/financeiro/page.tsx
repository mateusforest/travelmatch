import {
  DollarSign,
  TrendingUp,
  Building2,
  Layers,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { PageHeader, SectionCard, StatCard } from "@/components/agencia/ui-bits"
import { RankingList } from "@/components/master/master-bits"

// Plataforma 0km: indicadores zerados e histórico vazio até haver assinaturas reais.
const indicators = [
  { icon: DollarSign, label: "MRR", value: "R$ 0", hint: "Receita recorrente mensal" },
  { icon: TrendingUp, label: "ARR", value: "R$ 0", hint: "Receita recorrente anual" },
  { icon: Building2, label: "Agências pagantes", value: "0", hint: "Assinaturas ativas" },
  { icon: Layers, label: "Planos ativos", value: "0", hint: "Inclui upgrades" },
]

const revenueByPlan: { name: string; value: string; meta?: string }[] = []

const history: {
  icon: typeof CheckCircle2
  color: string
  title: string
  desc: string
  value: string
  when: string
}[] = []

export default function MasterFinanceiroPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Financeiro"
        description="Receita e saúde financeira da plataforma."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {indicators.map((i) => (
          <StatCard key={i.label} {...i} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionCard title="Receita por plano">
            <RankingList items={revenueByPlan} />
          </SectionCard>
        </div>
        <div className="lg:col-span-3">
          <SectionCard title="Histórico recente">
            {history.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground">
                Nenhuma transação registrada ainda.
              </p>
            ) : (
            <ul className="flex flex-col">
              {history.map((h, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-0 last:pb-0 first:pt-0"
                >
                  <h.icon className={`h-5 w-5 shrink-0 ${h.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{h.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{h.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{h.value}</p>
                    <p className="text-xs text-muted-foreground">{h.when}</p>
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
