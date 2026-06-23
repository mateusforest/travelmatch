"use client"

import Image from "next/image"
import { ChevronRight, Star, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AgencyLogo } from "@/components/travelpro/agency-logo-image"

type Specialist = {
  name: string
  match: number
  description: string
  tags: string[]
  banner: string
  logo: string
}

// Plataforma 0km: sem mocks. Os especialistas reais virão das agências cadastradas.
const specialists: Specialist[] = []

export function SpecialistsSection() {
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

        {specialists.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Especialistas a caminho
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              As agências verificadas mais compatíveis com o seu perfil serão
              recomendadas aqui em breve.
            </p>
          </div>
        ) : (
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
                  <Image
                    src={specialist.banner}
                    alt={specialist.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

                  {/* Match Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-primary px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg shadow-primary/20 ring-1 ring-primary/20">
                    <Star className="w-3 h-3 fill-primary" />
                    {specialist.match}% Match
                  </div>

                  {/* Logo */}
                  <div className="absolute -bottom-6 left-4">
                    <div className="h-16 w-16 rounded-xl border border-border bg-card shadow-lg">
                      <AgencyLogo
                        src={specialist.logo}
                        name={specialist.name}
                        className="h-full w-full rounded-xl"
                      />
                    </div>
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
                    variant="outline"
                    className="w-full rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 mt-auto"
                  >
                    Ver especialista
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        {/* CTA */}
        {specialists.length > 0 && (
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
            Ver mais especialistas
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
        )}
      </div>
    </section>
  )
}
