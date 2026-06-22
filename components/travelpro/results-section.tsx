"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, ChevronRight, Clock, MapPin, Star, Award, PackageIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { hasSupabaseEnv } from "@/lib/supabase/config"
import { formatCurrencyBRL } from "@/lib/format"
import { calculateMatchScore, defaultMatchSettings, normalizeSearchText, type MatchSettings } from "@/lib/match-score"
import { createTravelerLead, registerCtaEvent, registerWhatsAppClick } from "@/app/actions/public"

type Package = {
  id: string
  slug: string
  title: string
  image: string
  destination: string
  agency: string
  agencyId: string | null
  categorySlug: string | null
  price: string
  duration: string
  match: number
  tags: string[]
}

type SearchAgency = {
  id: string
  slug: string | null
  name: string
  city: string
  logo: string | null
  description: string
  rating: number
  reviews: number
  packageCount: number
  specialties: string[]
}

type Relation<T> = T | T[] | null

type PackageRow = {
  id: string
  slug: string
  title: string
  image_url: string | null
  destination: string
  description: string
  price_from: number | null
  duration_days: number | null
  featured: boolean
  agency_profiles: Relation<{
    agency_name: string
    status: string
    agency_subscriptions?: { status: string; subscription_plans?: { priority_level: number }[] | null }[] | null
  }>
  travel_categories: Relation<{ name: string; slug: string }>
  package_views?: { count: number }[]
  traveler_leads?: { count: number }[]
  agency_id: string | null
}

type AgencyRow = {
  id: string
  slug: string | null
  agency_name: string
  city: string | null
  state: string | null
  description: string | null
  logo_url: string | null
  packages?: {
    status: string
    title: string
    destination: string
    travel_categories?: Relation<{ name: string; slug: string }>
  }[] | null
}

const firstRelation = <T,>(relation: Relation<T>): T | null =>
  Array.isArray(relation) ? relation[0] ?? null : relation

export function ResultsSection({ query }: { query?: string }) {
  const [packages, setPackages] = useState<Package[]>([])
  const [agencies, setAgencies] = useState<SearchAgency[]>([])

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setPackages([])
      setAgencies([])
      return
    }

    const supabase = createSupabaseBrowserClient()
    const settingsRequest = supabase
      .from("match_settings")
      .select("destination_weight,category_weight,budget_weight,date_weight,travelers_weight,featured_bonus,performance_bonus,reputation_weight")
      .limit(1)
      .maybeSingle()

    let request = supabase
      .from("packages")
      .select("id,slug,title,agency_id,image_url,destination,description,price_from,duration_days,featured,agency_profiles(agency_name,status,agency_subscriptions(status,subscription_plans(priority_level))),travel_categories(name,slug),package_views(count),traveler_leads(count)")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100)

    const term = query?.trim()

    const agenciesRequest = supabase
      .from("agency_profiles")
      .select("id,slug,agency_name,city,state,description,logo_url,packages(status,title,destination,travel_categories(name,slug))")
      .eq("status", "active")
      .limit(60)

    Promise.all([request, settingsRequest, agenciesRequest])
      .then(async ([{ data, error }, { data: settingsData }, { data: agenciesData, error: agenciesError }]) => {
        if (error || agenciesError) {
          setPackages([])
          setAgencies([])
          return
        }

        const settings = (settingsData ?? defaultMatchSettings) as MatchSettings
        const normalizedTerm = normalizeSearchText(term)
        const activePackages = ((data ?? []) as PackageRow[])
          .filter((pkg) => firstRelation(pkg.agency_profiles)?.status === "active")
          .filter((pkg) => {
            const agency = firstRelation(pkg.agency_profiles)
            const category = firstRelation(pkg.travel_categories)

            return (
              !normalizedTerm ||
              [
                pkg.title,
                pkg.destination,
                pkg.description,
                category?.name,
                category?.slug,
                agency?.agency_name,
              ].some((value) => normalizeSearchText(value).includes(normalizedTerm))
            )
          })
        const agencyIds = Array.from(new Set(activePackages.map((pkg) => pkg.agency_id).filter(Boolean))) as string[]
        const reputationEntries = await Promise.all(
          agencyIds.map(async (agencyId) => {
            const { data: reputation } = await supabase.rpc("get_agency_reputation_summary", {
              target_agency_id: agencyId,
            })
            const row = Array.isArray(reputation) ? reputation[0] : null
            return [agencyId, row?.reputation_score ?? 0] as const
          }),
        )
        const reputationByAgency = new Map(reputationEntries)
        const next = activePackages
          .sort(
            (a, b) =>
              calculateMatchScore(
                {
                  title: b.title,
                  destination: b.destination,
                  description: b.description,
                  categorySlug: firstRelation(b.travel_categories)?.slug,
                  categoryName: firstRelation(b.travel_categories)?.name,
                  priceFrom: b.price_from,
                  featured: b.featured,
                  views: b.package_views?.[0]?.count ?? 0,
                  leads: b.traveler_leads?.[0]?.count ?? 0,
                  reputationScore: b.agency_id ? reputationByAgency.get(b.agency_id) ?? 0 : 0,
                  priorityLevel: firstRelation(b.agency_profiles)?.agency_subscriptions?.find((sub) => (sub as { status?: string }).status === "active")?.subscription_plans?.[0]?.priority_level ?? 0,
                },
                { query: term },
                settings,
              ) -
              calculateMatchScore(
                {
                  title: a.title,
                  destination: a.destination,
                  description: a.description,
                  categorySlug: firstRelation(a.travel_categories)?.slug,
                  categoryName: firstRelation(a.travel_categories)?.name,
                  priceFrom: a.price_from,
                  featured: a.featured,
                  views: a.package_views?.[0]?.count ?? 0,
                  leads: a.traveler_leads?.[0]?.count ?? 0,
                  reputationScore: a.agency_id ? reputationByAgency.get(a.agency_id) ?? 0 : 0,
                  priorityLevel: firstRelation(a.agency_profiles)?.agency_subscriptions?.find((sub) => (sub as { status?: string }).status === "active")?.subscription_plans?.[0]?.priority_level ?? 0,
                },
                { query: term },
                settings,
              ),
          )
          .slice(0, 8)
          .map((pkg) => ({
          id: pkg.id,
          slug: pkg.slug,
          title: pkg.title,
          image: pkg.image_url || "/category-images/aventura.svg",
          destination: pkg.destination,
          agency: firstRelation(pkg.agency_profiles)?.agency_name ?? "Agência",
          agencyId: pkg.agency_id,
          categorySlug: firstRelation(pkg.travel_categories)?.slug ?? null,
          price: formatCurrencyBRL(pkg.price_from),
          duration: pkg.duration_days ? `${pkg.duration_days} dias` : "Sob consulta",
          match: calculateMatchScore(
            {
              title: pkg.title,
              destination: pkg.destination,
              description: pkg.description,
              categorySlug: firstRelation(pkg.travel_categories)?.slug,
              categoryName: firstRelation(pkg.travel_categories)?.name,
              priceFrom: pkg.price_from,
              featured: pkg.featured,
              views: pkg.package_views?.[0]?.count ?? 0,
              leads: pkg.traveler_leads?.[0]?.count ?? 0,
              reputationScore: pkg.agency_id ? reputationByAgency.get(pkg.agency_id) ?? 0 : 0,
              priorityLevel: firstRelation(pkg.agency_profiles)?.agency_subscriptions?.find((sub) => (sub as { status?: string }).status === "active")?.subscription_plans?.[0]?.priority_level ?? 0,
            },
            { query: term },
            settings,
          ),
          tags: [firstRelation(pkg.travel_categories)?.name].filter(Boolean) as string[],
        }))
        setPackages(next)

        const agencyRows = ((agenciesData ?? []) as AgencyRow[])
          .map((agency) => {
            const publishedPackages = (agency.packages ?? []).filter((pkg) => pkg.status === "published")
            const searchableValues = [
              agency.agency_name,
              agency.city,
              agency.state,
              agency.description,
              ...publishedPackages.flatMap((pkg) => [
                pkg.title,
                pkg.destination,
                firstRelation(pkg.travel_categories)?.name,
                firstRelation(pkg.travel_categories)?.slug,
              ]),
            ]
            const specialties = Array.from(new Set(
              publishedPackages
                .map((pkg) => firstRelation(pkg.travel_categories)?.name)
                .filter(Boolean) as string[],
            )).slice(0, 3)

            return { agency, publishedPackages, searchableValues, specialties }
          })
          .filter(({ agency, publishedPackages, searchableValues }) =>
            Boolean(agency.slug) &&
            publishedPackages.length > 0 &&
            (!normalizedTerm || searchableValues.some((value) => normalizeSearchText(value).includes(normalizedTerm))),
          )
          .slice(0, 4)

        const agencyReputationEntries = await Promise.all(
          agencyRows.map(async ({ agency }) => {
            const { data: reputation } = await supabase.rpc("get_agency_reputation_summary", {
              target_agency_id: agency.id,
            })
            const row = Array.isArray(reputation) ? reputation[0] : null
            return [agency.id, row] as const
          }),
        )
        const agencyReputationById = new Map(agencyReputationEntries)

        setAgencies(agencyRows.map(({ agency, publishedPackages, specialties }) => {
          const reputation = agencyReputationById.get(agency.id)

          return {
            id: agency.id,
            slug: agency.slug,
            name: agency.agency_name,
            city: [agency.city, agency.state].filter(Boolean).join(", ") || "Brasil",
            logo: agency.logo_url,
            description: agency.description ?? "Perfil público em construção.",
            rating: Number(reputation?.average_rating ?? 0),
            reviews: Number(reputation?.review_count ?? 0),
            packageCount: publishedPackages.length,
            specialties,
          }
        }))
      })
  }, [query])

  const registerInterest = (pkg: Package, message: string) => {
    if (!hasSupabaseEnv()) {
      return
    }

    void createTravelerLead({
      package_id: pkg.id,
      agency_id: pkg.agencyId,
      desired_destination: pkg.destination,
      category_slug: pkg.categorySlug,
      message,
      source: "search_results",
      source_page: query ? `/?busca=${query}` : "/",
      cta_label: "WhatsApp",
    })
    void registerWhatsAppClick({
      package_id: pkg.id,
      agency_id: pkg.agencyId,
      source_page: query ? `/?busca=${query}` : "/",
      cta_label: "WhatsApp",
    })
  }

  const registerPackageClick = (pkg: Package) => {
    if (!hasSupabaseEnv()) {
      return
    }

    void registerCtaEvent({
      package_id: pkg.id,
      agency_id: pkg.agencyId,
      event_type: "view_package",
      cta_label: "Detalhes",
      source_page: query ? `/?busca=${query}` : "/",
    })
  }

  return (
    <section className="py-24 relative" id="pacotes">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Pacotes mais compatíveis com{" "}
            <span className="text-primary">você</span>.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Opções selecionadas a partir do seu perfil e dos especialistas
            recomendados.
          </p>
        </motion.div>

        {packages.length === 0 && agencies.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Em breve, pacotes para o seu perfil
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Assim que as agências publicarem seus pacotes, as melhores opções
              compatíveis com a sua busca aparecerão aqui.
            </p>
          </div>
        ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm shadow-black/[0.04] hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.destination}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Match Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-primary px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg shadow-primary/20 ring-1 ring-primary/20">
                    <Star className="w-3 h-3 fill-primary" />
                    {pkg.match}% match
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/90 text-sm">
                    <Clock className="w-4 h-4" />
                    {pkg.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-foreground">
                        {pkg.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        {pkg.destination}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{pkg.agency}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pkg.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-secondary rounded-md text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-xs text-muted-foreground">a partir de</span>
                    <p className="text-2xl font-bold text-foreground">{pkg.price}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5"
                    >
                      <Link
                        href={`/pacotes/${pkg.slug}`}
                        onClick={() => registerPackageClick(pkg)}
                      >
                        Detalhes
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                    <Button
                      onClick={() => registerInterest(pkg, "Solicitou contato via WhatsApp")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {agencies.length > 0 && (
          <div className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Agências compatíveis
                </p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">
                  Especialistas para sua busca
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {agencies.map((agency, index) => (
                <motion.div
                  key={agency.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm shadow-black/[0.04] transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-primary/10">
                        {agency.logo ? (
                          <Image
                            src={agency.logo}
                            alt={agency.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <Award className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-base font-semibold text-foreground">{agency.name}</h4>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {agency.city}
                        </p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {agency.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {agency.specialties.map((specialty) => (
                        <span key={specialty} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          {specialty}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        {agency.reviews > 0 ? agency.rating.toFixed(1) : "Novo"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <PackageIcon className="h-3.5 w-3.5 text-primary" />
                        {agency.packageCount} pacotes
                      </span>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="mt-4 w-full rounded-xl border-border hover:border-primary/50 hover:bg-primary/5"
                    >
                      <Link href={agency.slug ? `/agencias/${agency.slug}` : "#"}>
                        Ver perfil
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        </>
        )}

        {/* View More */}
        {packages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-border hover:border-primary/50 hover:bg-primary/5"
          >
            Ver mais opções
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
        )}
      </div>
    </section>
  )
}
