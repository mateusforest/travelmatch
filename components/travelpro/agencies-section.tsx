"use client"

import Image from "next/image"
import { MapPin, ChevronRight, Award } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

type Agency = {
  name: string
  city: string
  specialty: string
  description: string
  logo: string
  banner: string
  featured: boolean
}

// Plataforma 0km: sem mocks. As agências reais virão dos cadastros aprovados.
const agencies: Agency[] = []

export function AgenciesSection() {
  return (
    <section className="py-24" id="agencias">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Especialistas selecionados para cada tipo de{" "}
            <span className="text-primary">viagem</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agencies.map((agency, index) => (
            <motion.div
              key={agency.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm shadow-black/[0.04] hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10">
                {/* Banner */}
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={agency.banner}
                    alt={agency.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  
                  {/* Featured Badge */}
                  {agency.featured && (
                    <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Destaque
                    </div>
                  )}

                  {/* Logo */}
                  <div className="absolute -bottom-6 left-4">
                    <div className="w-16 h-16 rounded-xl bg-card border border-border overflow-hidden shadow-lg">
                      <Image
                        src={agency.logo}
                        alt={agency.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 pt-8">
                  <h3 className="font-semibold text-foreground text-lg mb-1">
                    {agency.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />
                    {agency.city}
                  </p>
                  <span className="inline-block text-xs px-2 py-1 bg-primary/10 text-primary rounded-md mb-3">
                    {agency.specialty}
                  </span>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {agency.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-border hover:border-primary/50 hover:bg-primary/5"
                  >
                    Ver agência
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}
