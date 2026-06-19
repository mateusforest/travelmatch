"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const badges = [
  { icon: ShieldCheck, label: "Dados seguros" },
  { icon: Clock, label: "Setup em 24h" },
  { icon: Zap, label: "Suporte dedicado" },
]

export function DivulgarCta() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Comece a divulgar seus pacotes{" "}
            <span className="text-primary">hoje</span>.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Crie o perfil da sua agência e comece a receber leads qualificados.
          </p>

          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-primary/20"
          >
            <Link href="/cadastro-agencia">
              Criar conta da agência
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <badge.icon className="w-4 h-4 text-primary" />
                {badge.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
