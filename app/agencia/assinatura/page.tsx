import { Check, CreditCard, Sparkles } from "lucide-react"
import { cancelAgencySubscription, checkoutPromotion, checkoutSubscription } from "@/app/actions/billing"
import { Button } from "@/components/ui/button"
import { PageHeader, SectionCard } from "@/components/agencia/ui-bits"
import { getAgencyBillingData } from "@/lib/data/billing"

const promotionOptions = [
  {
    type: "featured_7",
    title: "Destaque 7 dias",
    price: "R$ 97,00",
    includes: [
      "Destaque na landing",
      "Destaque na busca",
    ],
  },
  {
    type: "featured_15",
    title: "Destaque 15 dias",
    price: "R$ 197,00",
    includes: [
      "Destaque na landing",
      "Destaque na busca",
      "Prioridade adicional",
    ],
  },
  {
    type: "featured_30",
    title: "Destaque 30 dias",
    price: "R$ 497,00",
    includes: [
      "Destaque na landing",
      "Destaque na busca",
      "Prioridade máxima",
    ],
  },
  {
    type: "boost",
    title: "TravelMatch Boost",
    price: "R$ 987,00",
    includes: [
      "Destaque premium",
      "Postagem dedicada no Instagram TravelMatch",
      "Anúncio dedicado",
      "Tráfego pago incluso",
      "Relatório da campanha",
    ],
  },
] as const

const planBenefits: Record<string, string[]> = {
  free: [
    "Até 3 pacotes publicados",
    "Perfil público",
    "Recebimento de leads",
    "Avaliações",
    "Match básico",
    "Analytics básico",
    "Sem destaque pago incluso",
    "Sem prioridade no match",
    "Sem analytics avançado",
  ],
  pro: [
    "Até 30 pacotes publicados",
    "Analytics completos",
    "Perfil público avançado",
    "Avaliações",
    "Match avançado",
    "Leads ilimitados",
    "Funil comercial",
    "Timeline de leads",
    "Sugestões do COS",
  ],
  premium: [
    "Pacotes ilimitados",
    "Analytics avançados",
    "Perfil público avançado",
    "Match prioritário leve",
    "Leads ilimitados",
    "Prioridade em destaque orgânico",
    "Reputação avançada",
    "Insights do COS",
    "Acesso antecipado a recursos",
  ],
}

export default async function AssinaturaPage() {
  const billing = await getAgencyBillingData()
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_SITE_URL)

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
                Status: {billing.status} · Renovação: {billing.renewalDate}
              </p>
              <p className="text-sm text-muted-foreground">
                Pacotes: {billing.packageUsage} · Analytics: {billing.analyticsLevel}
              </p>
            </div>
          </div>
          <form action={checkoutSubscription.bind(null, billing.planSlug === "premium" ? "premium" : "pro")}>
            <Button
              type="submit"
              className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
              disabled={billing.planSlug === "premium" || !stripeReady}
            >
              Fazer upgrade
            </Button>
          </form>
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
                <span className="pb-1 text-sm text-muted-foreground">/mês</span>
              )}
            </div>
            <ul className="mt-5 space-y-2.5">
              {(planBenefits[plan.slug] ?? [plan.packageLimit, `Analytics ${plan.analyticsLevel}`, "Perfil público", "Leads e reputação"]).map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.slug === "premium" && (
              <p className="mt-4 rounded-xl bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
                Match prioritário leve nunca supera relevância e reputação.
              </p>
            )}
            {plan.slug === "free" ? (
              <Button
                variant="outline"
                className="mt-6 w-full rounded-full border-border hover:border-primary/40"
                disabled
              >
                {plan.current ? "Plano atual" : "Incluído"}
              </Button>
            ) : (
              <form action={checkoutSubscription.bind(null, plan.slug as "pro" | "premium")}>
                <Button
                  type="submit"
                  variant={plan.slug === "pro" ? "default" : "outline"}
                  className={`mt-6 w-full rounded-full ${
                    plan.slug === "pro"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border hover:border-primary/40"
                  }`}
                  disabled={plan.current || !stripeReady}
                >
                  {plan.current ? "Plano atual" : "Selecionar"}
                </Button>
              </form>
            )}
          </div>
        ))}
      </div>

      <SectionCard title="Pagamento" className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
              <CreditCard className="h-5 w-5" />
            </span>
            <span>
              Gateway: Stripe · Plano atual: {billing.planName} · Status: {billing.status} · Próxima renovação/vencimento: {billing.renewalDate}
            </span>
          </div>
          {billing.planSlug !== "free" && billing.status !== "Cancelado" && (
            <form action={cancelAgencySubscription}>
              <Button
                type="submit"
                variant="outline"
                className="rounded-full border-border hover:border-primary/40"
              >
                Cancelar plano
              </Button>
            </form>
          )}
        </div>
        {!stripeReady && (
          <p className="mt-3 rounded-xl border border-dashed border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
            Checkout Stripe preparado. Configure as chaves para ativar pagamentos reais.
          </p>
        )}
      </SectionCard>

      <SectionCard title="Produtos patrocinados" className="mt-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {promotionOptions.map((option) => (
            <form
              key={option.type}
              action={checkoutPromotion.bind(null, option.type)}
              className="rounded-xl border border-border bg-secondary/20 p-4"
            >
              <p className="text-sm font-semibold text-foreground">{option.title}</p>
              <p className="mt-1 text-lg font-bold text-foreground">{option.price}</p>
              <ul className="mt-3 space-y-1.5">
                {option.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                type="submit"
                variant="outline"
                className="mt-4 w-full rounded-full border-border hover:border-primary/40"
                disabled={!stripeReady}
              >
                Comprar
              </Button>
            </form>
          ))}
        </div>
      </SectionCard>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Pagamentos recentes">
          {billing.payments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground">
              Nenhum pagamento registrado ainda.
            </p>
          ) : (
            <ul className="flex flex-col">
              {billing.payments.map((payment, i) => (
                <li
                  key={`${payment.product}-${i}`}
                  className="flex items-center justify-between gap-3 border-b border-border py-3 text-sm last:border-0 last:pb-0 first:pt-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{payment.product}</p>
                    <p className="text-xs text-muted-foreground">{payment.createdAt} · {payment.status} · {payment.gateway}</p>
                    {payment.invoiceUrl && (
                      <a href={payment.invoiceUrl} className="text-xs font-medium text-primary hover:underline">
                        Ver fatura
                      </a>
                    )}
                  </div>
                  <span className="font-semibold text-foreground">{payment.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Promoções">
          {billing.promotions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground">
              Nenhuma promoção ativa ou comprada ainda.
            </p>
          ) : (
            <ul className="flex flex-col">
              {billing.promotions.map((promotion, i) => (
                <li
                  key={`${promotion.type}-${i}`}
                  className="flex items-center justify-between gap-3 border-b border-border py-3 text-sm last:border-0 last:pb-0 first:pt-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{promotion.type}</p>
                    <p className="text-xs text-muted-foreground">{promotion.period} · {promotion.status}</p>
                    {promotion.reportUrl && (
                      <a href={promotion.reportUrl} className="text-xs font-medium text-primary hover:underline">
                        Ver relatório
                      </a>
                    )}
                  </div>
                  <span className="font-semibold text-foreground">{promotion.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  )
}

