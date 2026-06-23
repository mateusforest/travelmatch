import { Header } from "@/components/travelpro/header"
import { Footer } from "@/components/travelpro/footer"

export default function SuportePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 pb-16 pt-28 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm shadow-black/[0.03]">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Suporte</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            O suporte do beta fechado é realizado pelo e-mail contato@travelpromatch.com.br.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}
