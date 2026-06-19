"use client"

import { MapPin, Wallet, Compass, Award } from "lucide-react"
import { motion } from "framer-motion"

const factors = [
  {
    icon: MapPin,
    title: "Destino desejado",
  },
  {
    icon: Wallet,
    title: "Faixa de investimento",
  },
  {
    icon: Compass,
    title: "Perfil da viagem",
  },
  {
    icon: Award,
    title: "Especialização da agência",
  },
]

export function WhyMatchSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Por que esse <span className="text-primary">Match</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            O TravelMatch considera diversos fatores para encontrar as melhores
            opções.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {factors.map((factor, index) => (
            <motion.div
              key={factor.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm shadow-black/[0.04] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <factor.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground text-base">
                {factor.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
