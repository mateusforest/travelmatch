"use client"

import { useState, useTransition } from "react"
import { Star } from "lucide-react"
import { createAgencyReview } from "@/app/actions/public"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function ReviewForm({
  token,
  leadId,
  agencyId,
}: {
  token: string
  leadId: string
  agencyId: string
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const submit = () => {
    setFeedback(null)
    startTransition(async () => {
      const result = await createAgencyReview({
        token,
        lead_id: leadId,
        agency_id: agencyId,
        rating,
        comment,
        would_recommend: wouldRecommend,
      })
      setFeedback(result.ok ? "Avaliacao enviada. Obrigado!" : result.message ?? "Nao foi possivel enviar.")
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm shadow-black/[0.03]">
      <div>
        <Label>Nota</Label>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`grid h-10 w-10 place-items-center rounded-full border ${
                value <= rating ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
              }`}
              aria-label={`Nota ${value}`}
            >
              <Star className="h-4 w-4 fill-current" />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <Label htmlFor="review-comment">Comentario</Label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="mt-1.5 min-h-28 resize-none"
        />
      </div>
      <label className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={wouldRecommend}
          onChange={(event) => setWouldRecommend(event.target.checked)}
        />
        Recomendaria esta agencia
      </label>
      <Button
        onClick={submit}
        disabled={pending}
        className="mt-5 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Enviar avaliacao
      </Button>
      {feedback && <p className="mt-3 text-sm text-muted-foreground">{feedback}</p>}
    </div>
  )
}
