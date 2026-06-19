"use client"

import { useState } from "react"
import { Search, ArrowRight, Shield, Clock, Headphones } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const trustBadges = [
  { icon: Shield, text: "Dados seguros" },
  { icon: Clock, text: "Setup em 24h" },
  { icon: Headphones, text: "Suporte dedicado" },
]

export function FinalCtaSection() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            A próxima viagem perfeita{" "}
            <span className="text-primary">começa aqui</span>.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-12">
            Menos operação manual. Mais velocidade e automação.
          </p>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-2xl mx-auto mb-8"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex items-center bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/[0.06] ring-1 ring-black/[0.02]">
                <div className="flex items-center px-6">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Descreva sua viagem ideal..."
                  className="flex-1 py-5 pr-4 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-base md:text-lg"
                />
                <div className="pr-3">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-3 h-auto font-medium gap-2">
                    Encontrar
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 md:gap-10"
          >
            {trustBadges.map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <badge.icon className="w-4 h-4 text-primary" />
                <span className="text-sm">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
