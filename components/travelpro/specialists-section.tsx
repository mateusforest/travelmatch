"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Star, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AgencyLogo } from "@/components/travelpro/agency-logo-image"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { hasSupabaseEnv } from "@/lib/supabase/config"

type Specialist = {
  id: string
  slug: string
  name: string
  match: number
  description: string
  tags: string[]
  banner: string | null
  logo: string | null
}

type AgencyRow = {
  id: string
  slug: string | null
  agency_name: string
  city: string | null
  state: string | null
  description: string | null
  logo_url: string | null
  banner_url: string | null
  packages?: {
    status: string
    destination: string
    image_url: string | null
    travel_categories?: { name: string }[] | null
  }[] | null
}

export function SpecialistsSection() {
  const [specialists, setSpecialists] = useState<Specialist[]>([])

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setSpecialists([])
      return
    }

    const supabase = createSupabaseBrowserClient()
    supabase
      .from("agency_profiles")
      .select("id,slug,agency_name,city,state,description,logo_url,banner_url,packages(status,destination,image_url,travel_categories(name))")
      .eq("status", "active")
      .limit(8)
      .then(async ({ data, error }) => {
        if (error) {
          setSpecialists([])
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

        setSpecialists(rows
          .map((agency) => {
            const packages = (agency.packages ?? []).filter((pkg) => pkg.status === "published")
            const reputation = reputationByAgency.get(agency.id)
            const specialties = Array.from(new Set(
              packages.map((pkg) => pkg.travel_categories?.[0]?.name || pkg.destination).filter(Boolean) as string[],
            )).slice(0, 3)

            return {
              id: agency.id,
              slug: agency.slug ?? "",
              name: agency.agency_name,
              match: Math.max(70, Math.min(98, Math.round(Number(reputation?.reputation_score ?? 70)))),
              description: agency.description ?? ([agency.city, agency.state].filter(Boolean).join(", ") || "Agência especialista em viagens personalizadas."),
              tags: specialties.length > 0 ? specialties : packages.map((pkg) => pkg.destination).slice(0, 3),
              banner: agency.banner_url ?? packages.find((pkg) => pkg.image_url)?.image_url ?? null,
              logo: agency.logo_url,
            }
          })
          .filter((agency) => agency.slug && agency.tags.length > 0)
          .slice(0, 3))
      })
  }, [])

  if (specialists.length === 0) {
    return null
  }

  return (
    <section className="py-24" id="especialistas">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Especialistas recomendados para{" "}
            <span className="text-primary">você</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Agências selecionadas com base no seu perfil de viagem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {specialists.map((specialist, index) => (
            <motion.div
              key={specialist.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm shadow-black/[0.04] hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 h-full flex flex-col">
                {/* Banner */}
                <div className="relative h-32 overflow-hidden">
                  {specialist.banner ? (
                    <Image
                      src={specialist.banner}
                      alt={specialist.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-primary/20 via-secondary to-primary/5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                  {/* Match Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-primary px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg shadow-primary/20 ring-1 ring-primary/20">
                    <Star className="w-3 h-3 fill-primary" />
                    {specialist.match}% Match
                  </div>

                  {/* Logo */}
                  <div className="absolute -bottom-6 left-4">
                    <AgencyLogo
                      src={specialist.logo}
                      name={specialist.name}
                      className="h-16 w-16 rounded-xl border border-border bg-white shadow-lg"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 pt-8 flex flex-col flex-1">
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {specialist.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {specialist.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-col gap-2 mb-5">
                    {specialist.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-primary" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 mt-auto"
                  >
                    <Link href={`/agencias/${specialist.slug}`}>
                      Ver especialista
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-border hover:border-primary/50 hover:bg-primary/5"
          >
            <Link href="#agencias">
              Ver mais especialistas
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
