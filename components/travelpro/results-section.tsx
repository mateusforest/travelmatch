"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { MessageCircle, ChevronRight, Clock, MapPin, Star } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { formatCurrencyBRL } from "@/lib/format"
import { createTravelerLead } from "@/app/actions/public"

type Package = {
  id: string
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

type PackageRow = {
  id: string
  image_url: string | null
  destination: string
  price_from: number | null
  duration_days: number | null
  agency_profiles: { agency_name: string }[] | null
  travel_categories: { name: string; slug: string }[] | null
  agency_id: string | null
}

export function ResultsSection({ query }: { query?: string }) {
  const [packages, setPackages] = useState<Package[]>([])

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    let request = supabase
      .from("packages")
      .select("id,agency_id,image_url,destination,price_from,duration_days,agency_profiles(agency_name),travel_categories(name,slug)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(8)

    const term = query?.trim()
    if (term) {
      request = request.or(`destination.ilike.%${term}%,title.ilike.%${term}%`)
    }

    request
      .then(({ data }) => {
        const next = ((data ?? []) as PackageRow[]).map((pkg) => ({
          id: pkg.id,
          image: pkg.image_url || "/placeholder.jpg",
          destination: pkg.destination,
          agency: pkg.agency_profiles?.[0]?.agency_name ?? "Agência",
          agencyId: pkg.agency_id,
          categorySlug: pkg.travel_categories?.[0]?.slug ?? null,
          price: formatCurrencyBRL(pkg.price_from),
          duration: pkg.duration_days ? `${pkg.duration_days} dias` : "Sob consulta",
          match: 0,
          tags: [pkg.travel_categories?.[0]?.name].filter(Boolean) as string[],
        }))
        setPackages(next)
      })
  }, [query])

  const registerInterest = (pkg: Package, message: string) => {
    void createTravelerLead({
      package_id: pkg.id,
      agency_id: pkg.agencyId,
      desired_destination: pkg.destination,
      category_slug: pkg.categorySlug,
      message,
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

        {packages.length === 0 ? (
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
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {pkg.destination}
                      </h3>
                      <p className="text-sm text-muted-foreground">{pkg.agency}</p>
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
                      variant="outline"
                      onClick={() => registerInterest(pkg, "Solicitou detalhes do pacote")}
                      className="flex-1 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5"
                    >
                      Detalhes
                      <ChevronRight className="w-4 h-4 ml-1" />
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
