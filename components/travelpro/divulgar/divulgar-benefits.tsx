"use client"

import { motion } from "framer-motion"
import {
  Globe,
  Package,
  Users,
  Star,
  Sparkles,
  BarChart3,
} from "lucide-react"

const benefits = [
  {
    icon: Globe,
    title: "Página pública da agência",
    description: "Um perfil profissional para apresentar sua marca e destinos.",
  },
  {
    icon: Package,
    title: "Pacotes ilimitados",
    description: "Publique quantos pacotes quiser, sem restrições de catálogo.",
  },
  {
    icon: Users,
    title: "Recebimento de leads",
    description: "Receba contatos de viajantes interessados diretamente.",
  },
  {
    icon: Star,
    title: "Destaque nos resultados",
    description: "Apareça com prioridade para o público mais compatível.",
  },
  {
    icon: Sparkles,
    title: "Match inteligente",
    description: "Nossa IA conecta seus pacotes ao perfil certo de viajante.",
  },
  {
    icon: BarChart3,
    title: "Estatísticas e desempenho",
    description: "Acompanhe visualizações, leads e conversões em tempo real.",
  },
]

export function DivulgarBenefits() {
  return (
    <section id="planos" className="scroll-mt-28 py-20 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Tudo o que sua agência precisa para{" "}
            <span className="text-primary">vender mais</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ferramentas pensadas para conectar você aos viajantes certos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="bg-card border border-border rounded-2xl p-7 shadow-sm shadow-black/[0.04] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-5">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
