import Image from "next/image"
import { notFound } from "next/navigation"
import { Globe, Instagram, MapPin, Package, Phone, Star } from "lucide-react"
import { Header } from "@/components/travelpro/header"
import { Footer } from "@/components/travelpro/footer"
import { LeadForm } from "@/components/travelpro/lead-form"
import { AgencyViewTracker } from "@/components/travelpro/view-tracker"
import { TrackedLink } from "@/components/travelpro/tracked-link"
import { AgencyLogoImage } from "@/components/travelpro/agency-logo-image"
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
              <div className="relative h-44 bg-gradient-to-r from-primary/30 to-primary/10">
                {agency.banner_url && (
                  <Image
                    src={agency.banner_url}
                    alt={agency.agency_name}
                    fill
                    priority
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/35 to-transparent" />
              </div>
              <div className="px-6 pb-6">
                <AgencyLogoImage
                  src={agency.logo_url}
                  name={agency.agency_name}
                  className="-mt-10 mb-4 h-20 w-20 rounded-2xl border-4 border-card"
                  imageClassName="p-2"
                />
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
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    {agency.review_count > 0
                      ? `Nota ${agency.average_rating.toFixed(1)} · ${agency.review_count} avaliações · ${agency.recommendation_rate}% recomendam`
                      : "Reputação em construção"}
                  </span>
                  {agency.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-primary" />
                      {agency.phone}
                    </span>
                  )}
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
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
                    >
                      <div className="relative aspect-[16/9] bg-secondary">
                        {pkg.image_url ? (
                          <Image
                            src={pkg.image_url}
                            alt={pkg.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 via-secondary to-primary/5">
                            <Package className="h-8 w-8 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground">{pkg.destination}</p>
                        <h3 className="mt-1 font-semibold text-foreground">{pkg.title}</h3>
                        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-foreground">{pkg.price}</span>
                          <span className="text-muted-foreground">{pkg.duration}</span>
                        </div>
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
