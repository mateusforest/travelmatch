"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Award, ChevronRight, MapPin, Package, Star } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { hasSupabaseEnv } from "@/lib/supabase/config"

type AgencyRow = {
  id: string
  slug: string | null
  agency_name: string
  city: string | null
  state: string | null
  description: string | null
  logo_url: string | null
  packages?: { status: string; travel_categories?: { name: string }[] | null }[] | null
}

type Agency = {
  id: string
  slug: string | null
  name: string
  city: string
  description: string
  logo: string | null
  rating: number
  reviews: number
  packageCount: number
  specialties: string[]
}

export function AgenciesSection() {
  const [agencies, setAgencies] = useState<Agency[]>([])

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setAgencies([])
      return
    }

    const supabase = createSupabaseBrowserClient()
    supabase
      .from("agency_profiles")
      .select("id,slug,agency_name,city,state,description,logo_url,packages(status,travel_categories(name))")
      .eq("status", "active")
      .limit(8)
      .then(async ({ data, error }) => {
        if (error) {
          setAgencies([])
          return
        }

        const rows = (data ?? []) as AgencyRow[]
        const reputationEntries = await Promise.all(
          rows.map(async (agency) => {
            const { data: reputation } = await supabase.rpc("get_agency_reputation_summary", {
              target_agency_id: agency.id,
            })
            const row = Array.isArray(reputation) ? reputation[0] : null
            return [agency.id, row] as const
          }),
        )
        const reputationByAgency = new Map(reputationEntries)

        setAgencies(rows.map((agency) => {
          const publishedPackages = (agency.packages ?? []).filter((pkg) => pkg.status === "published")
          const specialties = Array.from(new Set(
            publishedPackages
              .map((pkg) => pkg.travel_categories?.[0]?.name)
              .filter(Boolean) as string[],
          )).slice(0, 2)
          const reputation = reputationByAgency.get(agency.id)

          return {
            id: agency.id,
            slug: agency.slug,
            name: agency.agency_name,
            city: [agency.city, agency.state].filter(Boolean).join(", ") || "Brasil",
            description: agency.description ?? "Perfil público em construção.",
            logo: agency.logo_url,
            rating: Number(reputation?.average_rating ?? 0),
            reviews: Number(reputation?.review_count ?? 0),
            packageCount: publishedPackages.length,
            specialties,
          }
        }).filter((agency) => agency.slug && agency.packageCount > 0).slice(0, 4))
      })
  }, [])

  return (
    <section className="py-24" id="agencias">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground text-balance md:text-4xl lg:text-5xl">
            Especialistas selecionados para cada tipo de{" "}
            <span className="text-primary">viagem</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Agências verificadas e especializadas nos destinos que você procura.
          </p>
        </motion.div>

        {agencies.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Agências em breve
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Agências verificadas e especializadas para cada tipo de viagem
              aparecerão aqui assim que entrarem na plataforma.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {agencies.map((agency, index) => (
              <motion.div
                key={agency.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
                          className="object-contain p-2"
                        />
                      ) : (
                        <Award className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-foreground">
                        {agency.name}
                      </h3>
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
                      <Package className="h-3.5 w-3.5 text-primary" />
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
        )}
      </div>
    </section>
  )
}
