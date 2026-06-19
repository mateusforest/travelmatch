"use client"

import { ShieldCheck, DollarSign, Headphones, Heart } from "lucide-react"
import { motion } from "framer-motion"

const benefits = [
  {
    icon: ShieldCheck,
    title: "Agências verificadas",
    description: "Todos os nossos parceiros são verificados e avaliados.",
  },
  {
    icon: DollarSign,
    title: "Melhores preços",
    description: "Compare condições e encontre o melhor custo-benefício.",
  },
  {
    icon: Headphones,
    title: "Atendimento humano",
    description: "Fale com especialistas sempre que precisar.",
  },
  {
    icon: Heart,
    title: "Viagem personalizada",
    description: "Roteiros feitos sob medida para o seu estilo.",
  },
]

export function BenefitsSection() {
  return (
    <section className="pb-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm shadow-black/[0.04]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex items-start gap-4"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
