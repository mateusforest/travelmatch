import type { Metadata } from "next"
import { Header } from "@/components/travelpro/header"
import { Footer } from "@/components/travelpro/footer"
import { DivulgarHero } from "@/components/travelpro/divulgar/divulgar-hero"
import { DivulgarBenefits } from "@/components/travelpro/divulgar/divulgar-benefits"
import { DivulgarDifferential } from "@/components/travelpro/divulgar/divulgar-differential"
import { DivulgarCta } from "@/components/travelpro/divulgar/divulgar-cta"

export const metadata: Metadata = {
  title: "Divulgar meus pacotes | TravelMatch para agências",
  description:
    "Publique seus pacotes, receba leads qualificados e alcance viajantes que realmente procuram o que você oferece.",
}

export default function DivulgarPacotesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <DivulgarHero />
      <DivulgarBenefits />
      <DivulgarDifferential />
      <DivulgarCta />
      <Footer />
    </main>
  )
}
