import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Check, ArrowLeft } from "lucide-react"
import { CadastroForm } from "@/components/travelpro/cadastro/cadastro-form"

export const metadata: Metadata = {
  title: "Cadastro de agência | TravelMatch",
  description:
    "Crie o perfil da sua agência, publique seus pacotes e conecte-se a novos viajantes.",
}

const benefits = [
  "Perfil profissional",
  "Pacotes ilimitados",
  "Leads qualificados",
  "Match inteligente",
]

export default function CadastroAgenciaPage() {
  return (
    <main className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Left - Institutional */}
      <section className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden bg-secondary/40 border-r border-border">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center" aria-label="TravelMatch - Início">
            <Image
              src="/travelmatch-logo.png"
              alt="TravelMatch"
              width={440}
              height={100}
              priority
              className="h-10 w-auto"
            />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-bold text-foreground tracking-tight text-balance mb-5">
            Sua agência merece ser{" "}
            <span className="text-primary">encontrada</span>.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            Crie seu perfil, publique seus pacotes e conecte-se a novos
            viajantes.
          </p>

          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span className="text-foreground font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-sm text-muted-foreground">
          Plataforma conectada ao ecossistema TravelPro.
        </div>
      </section>

      {/* Right - Form */}
      <section className="flex flex-col px-5 sm:px-8 py-8 lg:py-12 lg:px-12 xl:px-20">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center justify-between">
          <Link href="/" aria-label="TravelMatch - Início">
            <Image
              src="/travelmatch-logo.png"
              alt="TravelMatch"
              width={396}
              height={90}
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/divulgar-pacotes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-6">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Criar conta da agência
            </h2>
            <p className="text-muted-foreground">
              Preencha os dados para começar a divulgar seus pacotes.
            </p>
          </div>

          <CadastroForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/entrar" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
