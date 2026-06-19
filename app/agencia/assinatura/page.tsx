import { Check, CreditCard, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader, SectionCard } from "@/components/agencia/ui-bits"
import { getAgencyBillingData } from "@/lib/data/billing"

export default async function AssinaturaPage() {
  const billing = await getAgencyBillingData()

  return (
    <>
      <PageHeader
        title="Assinatura"
        description="Gerencie seu plano, recursos e pagamento."
      />

      <SectionCard title="Plano atual" className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </span>
            <div>
              <p className="font-semibold text-foreground">{billing.planName}</p>
              <p className="text-sm text-muted-foreground">
                Status: {billing.status} · Renovacao: {billing.renewalDate}
              </p>
              <p className="text-sm text-muted-foreground">
                Pacotes: {billing.packageUsage} · Analytics: {billing.analyticsLevel}
              </p>
            </div>
          </div>
          <Button className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            Fazer upgrade
          </Button>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {billing.plans.map((plan) => (
          <div
            key={plan.slug}
            className={`relative rounded-2xl border bg-card p-6 shadow-sm shadow-black/[0.03] ${
              plan.slug === "pro" ? "border-primary/40 shadow-lg shadow-primary/10" : "border-border"
            }`}
          >
            {plan.slug === "pro" && (
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                Recomendado
              </span>
            )}
            <h3 className="font-semibold text-foreground">{plan.name}</h3>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {plan.price}
              </span>
              {plan.slug !== "free" && (
                <span className="pb-1 text-sm text-muted-foreground">/mes</span>
              )}
            </div>
            <ul className="mt-5 space-y-2.5">
              {[plan.packageLimit, `Analytics ${plan.analyticsLevel}`, "Perfil publico", "Leads e reputacao"].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.slug === "pro" ? "default" : "outline"}
              className={`mt-6 w-full rounded-full ${
                plan.slug === "pro"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border hover:border-primary/40"
              }`}
              disabled={plan.current}
            >
              {plan.current ? "Plano atual" : "Selecionar"}
            </Button>
          </div>
        ))}
      </div>

      <SectionCard title="Pagamento" className="mt-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
            <CreditCard className="h-5 w-5" />
          </span>
          Checkout preparado para Stripe e Mercado Pago. A finalizacao entra na Etapa 11.
        </div>
      </SectionCard>
    </>
  )
}
