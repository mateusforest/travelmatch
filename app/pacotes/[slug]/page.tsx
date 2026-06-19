import Image from "next/image"
import { notFound } from "next/navigation"
import { Clock, MapPin, Store } from "lucide-react"
import { Header } from "@/components/travelpro/header"
import { Footer } from "@/components/travelpro/footer"
import { LeadForm } from "@/components/travelpro/lead-form"
import { TrackedLink } from "@/components/travelpro/tracked-link"
import { PackageViewTracker } from "@/components/travelpro/view-tracker"
import { getPublicPackageBySlug } from "@/lib/data/public"

export default async function PublicPackagePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pkg = await getPublicPackageBySlug(slug)

  if (!pkg) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <PackageViewTracker packageId={pkg.id} agencyId={pkg.agency_id} />
      <section className="container mx-auto px-4 pb-16 pt-28 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03]">
              <div className="relative aspect-[16/9] bg-secondary">
                {pkg.image_url && (
                  <Image
                    src={pkg.image_url}
                    alt={pkg.title}
                    fill
                    priority
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-6">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {pkg.destination}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {pkg.title}
                </h1>
                <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {pkg.duration}
                  </span>
                  <span className="font-semibold text-foreground">{pkg.price}</span>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {pkg.description}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-black/[0.03]">
              <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Store className="h-4 w-4 text-primary" />
                Agência responsável
              </p>
              <h2 className="text-lg font-semibold text-foreground">{pkg.agency_name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {[pkg.agency_city, pkg.agency_state].filter(Boolean).join(", ") || "Brasil"}
              </p>
              {pkg.agency_description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {pkg.agency_description}
                </p>
              )}
              {pkg.agency_slug && (
                <TrackedLink
                  href={`/agencias/${pkg.agency_slug}`}
                  packageId={pkg.id}
                  agencyId={pkg.agency_id}
                  eventType="view_agency"
                  ctaLabel="Ver perfil da agencia"
                  className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Ver perfil da agência
                </TrackedLink>
              )}
            </div>
          </div>

          <div>
            <LeadForm
              packageId={pkg.id}
              agencyId={pkg.agency_id}
              destination={pkg.destination}
              categorySlug={pkg.category_slug}
              source="package_page"
              ctaLabel="Enviar interesse"
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
