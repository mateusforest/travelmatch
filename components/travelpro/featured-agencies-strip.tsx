"use client"

import Link from "next/link"
import { ChevronRight, MapPin, Package, Star } from "lucide-react"
import { motion } from "framer-motion"
import type { FeaturedAgency } from "@/lib/data/featured-agencies"
import { AgencyLogo } from "@/components/travelpro/agency-logo-image"

type FeaturedAgenciesStripProps = {
  agencies: FeaturedAgency[]
}

export function FeaturedAgenciesStrip({ agencies }: FeaturedAgenciesStripProps) {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Curadoria TravelMatch
            </p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Agências <span className="text-primary">em destaque</span>
            </h2>
          </div>
        </div>

        {agencies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              As agências em destaque aparecerão aqui conforme se cadastrarem e
              forem avaliadas pelos viajantes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency, index) => (
              <motion.div
                key={agency.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  href={`/agencias/${agency.slug}`}
                  className="group flex h-full gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
                >
                  <AgencyLogo
                    src={agency.logoUrl}
                    name={agency.name}
                    className="h-16 w-16 shrink-0 rounded-2xl border border-border"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">
                          {agency.name}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {[agency.city, agency.state].filter(Boolean).join(", ") || "Brasil"}
                        </p>
                      </div>
                      {(agency.pinned || agency.editorialLabel) && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                          {agency.editorialLabel || "Destaque"}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        {agency.rating}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Package className="h-3.5 w-3.5 text-primary" />
                        {agency.publishedPackages} pacotes
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 font-medium text-primary">
                        Ver perfil
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
