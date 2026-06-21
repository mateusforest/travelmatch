"use client"

import { useEffect, useState } from "react"
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

const categoryFallbackImage = "/hero-plane-window.png"

export function CategoriesSection({ onSearch }: { onSearch?: (value: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([])

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
      .neq("slug", "religioso")
      .order("name", { ascending: true })
      .then(({ data, error }) => setCategories(error ? [] : (data ?? [])))
  }, [])

  return (
    <section className="bg-gradient-to-b from-secondary/20 via-background to-secondary/30 py-28" id="experiencias">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="mb-5 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Explore por <span className="text-primary">categoria</span>
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Encontre a experiência perfeita para cada momento
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => onSearch?.(category.name)}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-card shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.02] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-primary/10">
                <Image
                  src={category.image_url || categoryFallbackImage}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-white/10 transition-all duration-500 group-hover:from-black/90" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3 className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-primary md:text-2xl">
                    {category.name}
                  </h3>
                  <div className="mt-3 h-px w-10 bg-primary/80 transition-all duration-300 group-hover:w-16" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
