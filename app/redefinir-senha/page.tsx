"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { updatePassword } from "@/app/actions/password"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)
    startTransition(async () => {
      const result = await updatePassword(password)
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
          <h1 className="text-2xl font-semibold text-foreground">Criar nova senha</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Digite uma nova senha para concluir a recuperação da conta.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nova senha"
              autoComplete="new-password"
              className="h-12 rounded-xl"
            />
            <Button type="submit" disabled={pending} className="h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Atualizar senha
            </Button>
          </form>
          {feedback && (
            <p className="mt-4 text-sm text-muted-foreground" role="status">
              {feedback}
            </p>
          )}
          {feedback?.includes("sucesso") && (
            <Button asChild variant="outline" className="mt-4 w-full rounded-xl">
              <Link href="/entrar">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
