"use client"

import Image from "next/image"
import { motion } from "framer-motion"

// Categorias de navegação (estrutura fixa da plataforma).
const categories = [
  {
    name: "Disney",
    image: "https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=600&q=80",
  },
  {
    name: "Nacional",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80",
  },
  {
    name: "Internacional",
    image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",
  },
  {
    name: "Lua de mel",
    image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80",
  },
  {
    name: "Cruzeiros",
    image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600&q=80",
  },
  {
    name: "Família",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
  },
  {
    name: "Resorts",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  },
  {
    name: "Consultorias",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
  },
]

export function CategoriesSection() {
  return (
    <section className="py-24 bg-secondary/30" id="experiencias">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Explore por <span className="text-primary">categoria</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encontre a experiência perfeita para cada momento
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-500" />
                
                {/* Glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
