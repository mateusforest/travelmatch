import { Header } from "@/components/travelpro/header"
import { Footer } from "@/components/travelpro/footer"

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 pb-16 pt-28 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-sm shadow-black/[0.03]">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Termos de uso</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              O TravelMatch conecta viajantes a agências e pacotes cadastrados na plataforma. Ao utilizar o serviço,
              você concorda em fornecer informações verdadeiras e usar os canais de contato de forma responsável.
            </p>
            <p>
              As ofertas, condições comerciais e atendimento são de responsabilidade das agências cadastradas. O
              TravelMatch atua como ambiente de descoberta, organização e conexão entre as partes.
            </p>
            <p>
              Estes termos são uma versão institucional inicial para o beta fechado e poderão ser atualizados antes da
              abertura pública da plataforma.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
