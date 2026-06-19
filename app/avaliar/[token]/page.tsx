import { notFound } from "next/navigation"
import { Header } from "@/components/travelpro/header"
import { Footer } from "@/components/travelpro/footer"
import { getReviewTokenDetails } from "@/lib/data/review-token"
import { ReviewForm } from "./review-form"

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const details = await getReviewTokenDetails(token)

  if (!details) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto max-w-xl px-4 pb-16 pt-28 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Avalie sua experiencia
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Conte como foi o atendimento da {details.agencyName}.
          </p>
        </div>
        <ReviewForm
          token={details.token}
          leadId={details.leadId}
          agencyId={details.agencyId}
        />
      </section>
      <Footer />
    </main>
  )
}
