"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { requestPasswordReset } from "@/app/actions/password"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)
    startTransition(async () => {
      const result = await requestPasswordReset(email)
      setFeedback(result.message)
    })
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <Link href="/" className="mb-10 inline-flex items-center" aria-label="TravelMatch - Início">
          <Image src="/travelmatch-logo.png" alt="TravelMatch" width={396} height={90} className="h-9 w-auto" />
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm shadow-black/[0.03]">
          <Link href="/entrar" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>
          <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold text-foreground">Recuperar senha</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Informe o e-mail da sua conta para receber o link de redefinição.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              className="h-12 rounded-xl"
            />
            <Button type="submit" disabled={pending} className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enviar link
            </Button>
          </form>
          {feedback && (
            <p className="mt-4 text-sm text-muted-foreground" role="status">
              {feedback}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
