"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { hasSupabaseEnv } from "@/lib/supabase/config"

type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
}

const categoryVisuals: Record<string, { image: string; description: string; order: number }> = {
  europa: {
    image: "/category-photos/europa.jpg",
    description: "Roteiros clássicos e experiências exclusivas",
    order: 1,
  },
  "estados-unidos": {
    image: "/category-photos/estados-unidos.jpg",
    description: "Cidades, parques e road trips",
    order: 2,
  },
  caribe: {
    image: "/category-photos/caribe.jpg",
    description: "Praias, resorts e descanso",
    order: 3,
  },
  disney: {
    image: "/category-photos/disney.jpg",
    description: "Experiências mágicas para todas as idades",
    order: 4,
  },
  cruzeiros: {
    image: "/category-photos/cruzeiros.jpg",
    description: "Viagens completas em alto-mar",
    order: 5,
  },
  "lua-de-mel": {
    image: "/category-photos/lua-de-mel.jpg",
    description: "Viagens para celebrar histórias",
    order: 6,
  },
  familia: {
    image: "/category-photos/familia.jpg",
    description: "Momentos para viver juntos",
    order: 7,
  },
  intercambio: {
    image: "/category-photos/intercambio.jpg",
    description: "Estudo e vivência internacional",
    order: 8,
  },
  corporativo: {
    image: "/category-photos/corporativo.jpg",
    description: "Viagens e eventos de negócios",
    order: 9,
  },
  neve: {
    image: "/category-photos/neve.jpg",
    description: "Destinos de inverno ao redor do mundo",
    order: 10,
  },
  luxo: {
    image: "/category-photos/luxo.jpg",
    description: "Experiências exclusivas",
    order: 11,
  },
  aventura: {
    image: "/category-photos/aventura.jpg",
    description: "Natureza, trilhas e adrenalina",
    order: 12,
  },
  "america-do-sul": {
    image: "/category-photos/america-do-sul.jpg",
    description: "Destinos próximos e inesquecíveis",
    order: 13,
  },
  grupos: {
    image: "/category-photos/grupos.jpg",
    description: "Viagens compartilhadas",
    order: 14,
  },
  exoticos: {
    image: "/category-photos/exoticos.jpg",
    description: "Experiências fora do comum",
    order: 15,
  },
}

export function CategoriesSection({ onSearch }: { onSearch?: (value: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setCategories([])
      return
    }

    const supabase = createSupabaseBrowserClient()
    supabase
      .from("travel_categories")
      .select("id,name,slug,image_url")
      .eq("active", true)
      .in("slug", Object.keys(categoryVisuals))
      .order("name", { ascending: true })
      .then(({ data, error }) => setCategories(error ? [] : (data ?? [])))
  }, [])

  const visibleCategories = useMemo(
    () =>
      categories
        .filter((category) => categoryVisuals[category.slug])
        .sort((a, b) => categoryVisuals[a.slug].order - categoryVisuals[b.slug].order),
    [categories],
  )

  return (
    <section className="bg-gradient-to-b from-secondary/10 via-background to-secondary/20 py-20 md:py-24" id="experiencias">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-8 max-w-3xl text-center md:mb-10"
        >
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Explore por <span className="text-primary">categoria</span>
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Encontre a experiência perfeita para cada momento
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {visibleCategories.map((category, index) => {
            const visual = categoryVisuals[category.slug]
            const imageFailed = failedImages.has(category.slug)

            return (
              <motion.button
                key={category.slug}
                type="button"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.035 }}
                className="group text-left"
                onClick={() => onSearch?.(category.name)}
              >
                <div className="relative aspect-[5/6] overflow-hidden rounded-[1.35rem] border border-white/10 bg-card shadow-sm shadow-black/[0.05] ring-1 ring-black/[0.03] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-primary/10">
                  {imageFailed ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-foreground/70 to-primary/20" />
                  ) : (
                    <Image
                      src={visual.image}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={() => setFailedImages((current) => new Set(current).add(category.slug))}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/42 to-black/8 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_32%,rgba(255,111,0,0.12))] opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="mb-3 h-px w-9 bg-primary/90 transition-all duration-300 group-hover:w-14" />
                    <h3 className="text-xl font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-primary">
                      {category.name}
                    </h3>
                    <p className="mt-2 min-h-[40px] text-sm leading-snug text-white/78">
                      {visual.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
