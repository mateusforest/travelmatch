import Link from "next/link"
import {
  Package,
  Inbox,
  Eye,
  TrendingUp,
  Plus,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  PageHeader,
  StatCard,
  SectionCard,
  EmptyState,
} from "@/components/agencia/ui-bits"
import { getAgencyDashboardData } from "@/lib/data/agency"

export default async function AgenciaDashboardPage() {
  const dashboard = await getAgencyDashboardData()
  const stats = [
    { icon: Package, label: "Pacotes ativos", value: String(dashboard.activePackages), hint: "publicados" },
    { icon: Inbox, label: "Leads recebidos", value: String(dashboard.leadsLast30Days), hint: "últimos 30 dias" },
    { icon: Eye, label: "Visualizações", value: String(dashboard.viewsLast30Days), hint: "últimos 30 dias" },
    { icon: TrendingUp, label: "Taxa de conversão", value: dashboard.conversionRate, hint: "média" },
  ]

  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Acompanhe a operação da sua agência em um só lugar."
        action={
          <Button
            asChild
            className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/agencia/pacotes/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo pacote
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {dashboard.unansweredAlerts > 0 && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 text-sm text-foreground">
          {dashboard.unansweredAlerts} lead(s) sem resposta dentro da regra operacional.
        </div>
      )}

      {/* Two columns */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Últimos leads"
          action={
            <Link
              href="/agencia/leads"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {dashboard.recentLeads.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Nenhum lead ainda"
              description="Quando viajantes demonstrarem interesse nos seus pacotes, eles aparecerão aqui."
            />
          ) : (
            <ul className="flex flex-col">
              {dashboard.recentLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0 last:pb-0 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{lead.interest}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p className="font-semibold text-primary">{lead.match}%</p>
                    <p>{lead.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Pacotes mais visualizados"
          action={
            <Link
              href="/agencia/pacotes"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver pacotes <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {dashboard.topViewedPackages.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Publique seu primeiro pacote"
              description="Pacotes publicados aparecem para viajantes compatíveis via Match inteligente."
              action={
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-border hover:border-primary/40"
                >
                  <Link href="/agencia/pacotes/novo">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar pacote
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col">
              {dashboard.topViewedPackages.map((pkg) => (
                <li
                  key={pkg.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0 last:pb-0 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{pkg.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{pkg.destination}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">{pkg.views}</p>
                    <p>views</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* COS suggestions */}
      <section className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.06] to-card p-5 shadow-sm shadow-black/[0.03]">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15">
            <Sparkles className="h-[18px] w-[18px] text-primary" />
          </span>
          <h2 className="text-base font-semibold text-foreground">
            Sugestões do COS
          </h2>
        </div>
        {dashboard.cosSuggestions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/70 p-4 text-sm leading-relaxed text-muted-foreground">
            Conforme sua agência publicar pacotes e receber leads, o COS trará
            recomendações personalizadas para melhorar sua performance aqui.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {dashboard.cosSuggestions.map((tip, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card/70 p-4 text-sm leading-relaxed text-foreground/90"
              >
                {tip}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
