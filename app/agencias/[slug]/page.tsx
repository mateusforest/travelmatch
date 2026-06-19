import Image from "next/image"
import { notFound } from "next/navigation"
import { Globe, Instagram, MapPin, Package } from "lucide-react"
import { Header } from "@/components/travelpro/header"
import { Footer } from "@/components/travelpro/footer"
import { LeadForm } from "@/components/travelpro/lead-form"
import { AgencyViewTracker } from "@/components/travelpro/view-tracker"
import { TrackedLink } from "@/components/travelpro/tracked-link"
import { getPublicAgencyBySlug } from "@/lib/data/public"

export default async function PublicAgencyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const agency = await getPublicAgencyBySlug(slug)

  if (!agency) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <AgencyViewTracker agencyId={agency.id} />
      <section className="container mx-auto px-4 pb-16 pt-28 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03]">
              <div className="h-36 bg-gradient-to-r from-primary/30 to-primary/10" />
              <div className="px-6 pb-6">
                <div className="-mt-10 mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-primary/10">
                  {agency.logo_url ? (
                    <Image
                      src={agency.logo_url}
                      alt={agency.agency_name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-primary" />
                  )}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {agency.agency_name}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {[agency.city, agency.state].filter(Boolean).join(", ") || "Brasil"}
                </p>
                {agency.description && (
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {agency.description}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {agency.website && (
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-primary" />
                      {agency.website}
                    </span>
                  )}
                  {agency.instagram && (
                    <span className="inline-flex items-center gap-1.5">
                      <Instagram className="h-4 w-4 text-primary" />
                      {agency.instagram}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Pacotes publicados
              </h2>
              {agency.packages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center text-sm text-muted-foreground">
                  Esta agência ainda não possui pacotes publicados.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {agency.packages.map((pkg) => (
                    <TrackedLink
                      key={pkg.id}
                      href={`/pacotes/${pkg.slug}`}
                      packageId={pkg.id}
                      agencyId={agency.id}
                      eventType="view_package"
                      ctaLabel="Ver pacote"
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03] transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-[16/9] bg-secondary">
                        {pkg.image_url && (
                          <Image
                            src={pkg.image_url}
                            alt={pkg.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground">{pkg.destination}</p>
                        <h3 className="mt-1 font-semibold text-foreground">{pkg.title}</h3>
                        <p className="mt-3 text-sm font-semibold text-foreground">{pkg.price}</p>
                      </div>
                    </TrackedLink>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <LeadForm agencyId={agency.id} source="agency_page" ctaLabel="Enviar interesse" />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
