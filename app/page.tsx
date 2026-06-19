import { Header } from "@/components/travelpro/header"
import { HomeExperience } from "@/components/travelpro/home-experience"
import { Footer } from "@/components/travelpro/footer"
import { getFeaturedAgencies } from "@/lib/data/featured-agencies"

export default async function TravelMatchPage() {
  const featuredAgencies = await getFeaturedAgencies()

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HomeExperience featuredAgencies={featuredAgencies} />
      <Footer />
    </main>
  )
}
