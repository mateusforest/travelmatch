import {
  CheckCircle2,
  EyeOff,
  Eye,
  MessageSquareWarning,
  Star,
} from "lucide-react"
import { PageHeader, SectionCard } from "@/components/agencia/ui-bits"
import { Button } from "@/components/ui/button"
import {
  getMasterReviewModerationItems,
  getMasterUnansweredLeadAlerts,
} from "@/lib/data/master"
import { setReviewHidden } from "@/app/actions/master"

export default async function MasterModeracaoPage() {
  const [reviews, alerts] = await Promise.all([
    getMasterReviewModerationItems(),
    getMasterUnansweredLeadAlerts(),
  ])

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Moderação"
        description="Centro de qualidade e aprovação da plataforma."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Avaliacoes"
          action={<Star className="h-4 w-4 text-muted-foreground" />}
        >
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </span>
              <p className="text-sm font-medium text-foreground">Fila vazia</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Nenhuma avaliação registrada ainda.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {reviews.map((review) => (
                <li key={review.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{review.agency}</p>
                    <p className="text-sm text-muted-foreground">
                      Nota {review.rating} · {review.wouldRecommend ? "Recomenda" : "Não recomenda"} · Lead {review.leadId}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                  <form
                    action={async () => {
                      "use server"
                      await setReviewHidden(review.id, !review.hidden)
                    }}
                  >
                    <Button size="sm" variant="outline" className="rounded-lg">
                      {review.hidden ? (
                        <Eye className="mr-1.5 h-4 w-4" />
                      ) : (
                        <EyeOff className="mr-1.5 h-4 w-4" />
                      )}
                      {review.hidden ? "Reexibir" : "Ocultar"}
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Leads sem resposta"
          action={<MessageSquareWarning className="h-4 w-4 text-muted-foreground" />}
        >
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </span>
              <p className="text-sm font-medium text-foreground">Sem alertas</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Nenhum lead ultrapassou a regra de resposta.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {alerts.map((alert) => (
                <li key={alert.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-medium text-foreground">{alert.agency}</p>
                  <p className="text-sm text-muted-foreground">
                    Lead {alert.id} · {alert.status} · {alert.createdAt}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

