import { Check, CreditCard, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader, SectionCard } from "@/components/agencia/ui-bits"

const plans = [
  {
    name: "Essencial",
    price: "Grátis",
    current: true,
    features: [
      "Até 3 pacotes publicados",
      "Perfil público",
      "Recebimento de leads",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Profissional",
    price: "R$ 149",
    period: "/mês",
    highlight: true,
    features: [
      "Pacotes ilimitados",
      "Destaque no Match",
      "Analytics avançado",
      "COS ilimitado",
      "Suporte prioritário",
    ],
  },
  {
    name: "Premium",
    price: "R$ 349",
    period: "/mês",
    features: [
      "Tudo do Profissional",
      "Posição premium no marketplace",
      "Gerente de conta dedicado",
      "Integrações personalizadas",
    ],
  },
]

export default function AssinaturaPage() {
  return (
    <>
      <PageHeader
        title="Assinatura"
        description="Gerencie seu plano, recursos e pagamento."
      />

      {/* Current plan */}
      <SectionCard title="Plano atual" className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Essencial</p>
              <p className="text-sm text-muted-foreground">
                Plano gratuito — ideal para começar
              </p>
            </div>
          </div>
          <Button className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90">
            Fazer upgrade
          </Button>
        </div>
      </SectionCard>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border bg-card p-6 shadow-sm shadow-black/[0.03] ${
              plan.highlight ? "border-primary/40 shadow-lg shadow-primary/10" : "border-border"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                Recomendado
              </span>
            )}
            <h3 className="font-semibold text-foreground">{plan.name}</h3>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {plan.price}
              </span>
              {plan.period && (
                <span className="pb-1 text-sm text-muted-foreground">
                  {plan.period}
                </span>
              )}
            </div>
            <ul className="mt-5 space-y-2.5">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-foreground/90"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.highlight ? "default" : "outline"}
              className={`mt-6 w-full rounded-full ${
                plan.highlight
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

      {/* Payment */}
      <SectionCard title="Pagamento" className="mt-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
            <CreditCard className="h-5 w-5" />
          </span>
          Nenhum método de pagamento cadastrado. Adicione um ao fazer upgrade
          para um plano pago.
        </div>
      </SectionCard>
    </>
  )
}
