"use client"

import { useState, useTransition } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createTravelerLead } from "@/app/actions/public"

type LeadFormProps = {
  packageId?: string | null
  agencyId?: string | null
  destination?: string | null
  categorySlug?: string | null
}

export function LeadForm({
  packageId,
  agencyId,
  destination,
  categorySlug,
}: LeadFormProps) {
  const [travelerName, setTravelerName] = useState("")
  const [travelerEmail, setTravelerEmail] = useState("")
  const [travelerPhone, setTravelerPhone] = useState("")
  const [desiredDestination, setDesiredDestination] = useState(destination ?? "")
  const [message, setMessage] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const submit = () => {
    setFeedback(null)
    startTransition(async () => {
      const result = await createTravelerLead({
        package_id: packageId,
        agency_id: agencyId,
        traveler_name: travelerName,
        traveler_email: travelerEmail,
        traveler_phone: travelerPhone,
        desired_destination: desiredDestination,
        category_slug: categorySlug,
        message,
      })

      if (result.ok) {
        setFeedback("Interesse enviado.")
        setTravelerName("")
        setTravelerEmail("")
        setTravelerPhone("")
        setMessage("")
      } else {
        setFeedback(result.message ?? "Não foi possível enviar seu interesse.")
      }
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm shadow-black/[0.03]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-foreground">Solicitar contato</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie seus dados para a agência responder com mais informações.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="lead-name">Nome</Label>
          <Input
            id="lead-name"
            value={travelerName}
            onChange={(e) => setTravelerName(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="lead-email">E-mail</Label>
            <Input
              id="lead-email"
              type="email"
              value={travelerEmail}
              onChange={(e) => setTravelerEmail(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="lead-phone">Telefone/WhatsApp</Label>
            <Input
              id="lead-phone"
              value={travelerPhone}
              onChange={(e) => setTravelerPhone(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="lead-destination">Destino desejado</Label>
          <Input
            id="lead-destination"
            value={desiredDestination}
            onChange={(e) => setDesiredDestination(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="lead-message">Mensagem</Label>
          <Textarea
            id="lead-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1.5 min-h-28 resize-none"
          />
        </div>
        <Button
          onClick={submit}
          disabled={pending}
          className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar interesse
        </Button>
        {feedback && (
          <p className="text-sm text-muted-foreground" role="status">
            {feedback}
          </p>
        )}
      </div>
    </div>
  )
}
