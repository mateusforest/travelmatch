import { Header } from "@/components/travelpro/header"
import { HomeExperience } from "@/components/travelpro/home-experience"
import { Footer } from "@/components/travelpro/footer"

export default function TravelMatchPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HomeExperience />
      <Footer />
    </main>
  )
}
