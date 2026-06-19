"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { signUpAgency } from "@/app/actions/auth"

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
]

type FormState = {
  agencia: string
  responsavel: string
  email: string
  telefone: string
  cidade: string
  estado: string
  senha: string
  confirmarSenha: string
  termos: boolean
}

const initialState: FormState = {
  agencia: "",
  responsavel: "",
  email: "",
  telefone: "",
  cidade: "",
  estado: "",
  senha: "",
  confirmarSenha: "",
  termos: false,
}

export function CadastroForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.senha !== form.confirmarSenha) {
      setError("As senhas não coincidem.")
      return
    }
    if (form.senha.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.")
      return
    }
    if (!form.termos) {
      setError("Você precisa aceitar os termos de uso.")
      return
    }

    setSubmitting(true)
    const result = await signUpAgency(form)
    if (result && !result.ok) {
      setError(result.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="agencia">Nome da agência</Label>
        <Input
          id="agencia"
          required
          value={form.agencia}
          onChange={(e) => update("agencia", e.target.value)}
          placeholder="Ex.: Mundo Afora Viagens"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsavel">Nome do responsável</Label>
        <Input
          id="responsavel"
          required
          value={form.responsavel}
          onChange={(e) => update("responsavel", e.target.value)}
          placeholder="Seu nome completo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="agencia@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          type="tel"
          required
          value={form.telefone}
          onChange={(e) => update("telefone", e.target.value)}
          placeholder="(00) 00000-0000"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            required
            value={form.cidade}
            onChange={(e) => update("cidade", e.target.value)}
            placeholder="Sua cidade"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select
            value={form.estado}
            onValueChange={(value) => update("estado", value)}
          >
            <SelectTrigger id="estado">
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {estados.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <div className="relative">
            <Input
              id="senha"
              type={showPassword ? "text" : "password"}
              required
              value={form.senha}
              onChange={(e) => update("senha", e.target.value)}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmarSenha">Confirmar senha</Label>
          <Input
            id="confirmarSenha"
            type={showPassword ? "text" : "password"}
            required
            value={form.confirmarSenha}
            onChange={(e) => update("confirmarSenha", e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 pt-1">
        <Checkbox
          id="termos"
          checked={form.termos}
          onCheckedChange={(checked) => update("termos", checked === true)}
          className="mt-0.5"
        />
        <Label htmlFor="termos" className="text-sm text-muted-foreground font-normal leading-relaxed">
          Aceito os{" "}
          <Link href="/termos" className="text-primary hover:underline">
            termos de uso
          </Link>{" "}
          e a política de privacidade.
        </Label>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-12 text-base font-medium shadow-lg shadow-primary/20"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Criando conta...
          </>
        ) : (
          <>
            Criar conta da agência
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  )
}
