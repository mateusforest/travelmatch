"use client"

import { Star, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import type { FeaturedAgency } from "@/lib/data/featured-agencies"

// Plataforma 0km: sem mocks. As agências em destaque virão dos cadastros reais.
type FeaturedAgenciesStripProps = {
  agencies: FeaturedAgency[]
}

export function FeaturedAgenciesStrip({ agencies }: FeaturedAgenciesStripProps) {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Agências <span className="text-primary">Destaques</span>
          </h2>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {agencies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              As agências em destaque aparecerão aqui conforme se cadastrarem e
              forem avaliadas pelos viajantes.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {agencies.map((agency, index) => (
            <motion.div
              key={agency.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 shadow-sm shadow-black/[0.04] hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <span className="text-sm font-semibold text-foreground text-center tracking-tight">
                {agency.name}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-primary text-primary" />
                {agency.rating}
              </span>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}
