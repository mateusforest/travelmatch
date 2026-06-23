import { Header } from "@/components/travelpro/header"
import { Footer } from "@/components/travelpro/footer"

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 pb-16 pt-28 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-sm shadow-black/[0.03]">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Política de privacidade</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Coletamos os dados necessários para cadastro, login, envio de interesse em pacotes, análise de desempenho
              e comunicação entre viajantes e agências.
            </p>
            <p>
              Dados de leads são disponibilizados apenas à agência relacionada e aos administradores autorizados da
              plataforma. Não exibimos dados privados de viajantes em páginas públicas.
            </p>
            <p>
              Esta política é uma versão inicial para o beta fechado e será revisada com a documentação jurídica
              definitiva do TravelMatch.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
