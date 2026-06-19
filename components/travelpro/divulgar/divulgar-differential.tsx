"use client"

import { motion } from "framer-motion"
import { Search, Sparkles, ShieldCheck } from "lucide-react"

const pillars = [
  {
    icon: Search,
    title: "Inteligência de busca",
    description: "Entendemos o que o viajante procura, em linguagem natural.",
  },
  {
    icon: Sparkles,
    title: "Tecnologia de Match",
    description: "Conectamos perfis e pacotes com alta compatibilidade.",
  },
  {
    icon: ShieldCheck,
    title: "Curadoria de agências",
    description: "Apenas especialistas verificados e qualificados.",
  },
]

export function DivulgarDifferential() {
  return (
    <section className="py-20 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-white to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[440px] bg-primary/[0.07] rounded-full blur-[170px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 text-balance">
            Muito além de um <span className="text-primary">marketplace</span>.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
            O TravelMatch conecta viajantes às agências mais compatíveis através
            de tecnologia de Match, curadoria e inteligência de busca.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-7 text-center shadow-sm shadow-black/[0.04]"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border shadow-lg shadow-black/[0.04] mb-5">
                <pillar.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
