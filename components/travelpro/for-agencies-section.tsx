"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle, Zap, TrendingUp, Users, Sparkles, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function ForAgenciesSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Light gradient + orange glow background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-white to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-primary/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Transforme seus pacotes em{" "}
            <span className="text-primary">oportunidades reais</span>.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha a melhor forma de divulgar seus pacotes no TravelMatch
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1 - Agência Parceira */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group"
          >
            <div className="h-full bg-card border border-border rounded-2xl p-8 shadow-sm shadow-black/[0.03] hover:shadow-xl hover:shadow-black/[0.06] transition-all duration-500">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary mb-6">
                <Users className="w-7 h-7 text-foreground" />
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2">
                Agência Parceira Match
              </h3>
              <p className="text-muted-foreground mb-6">
                Comece a divulgar seus pacotes e receba leads qualificados
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Publique pacotes ilimitados",
                  "Receba leads qualificados",
                  "Tenha página pública da agência",
                  "Apareça nas buscas inteligentes",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full rounded-xl border-border hover:border-primary/50 hover:bg-primary/5"
              >
                <Link href="/cadastro-agencia">
                  Anunciar no Match
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Card 2 - Agência com TravelPro (Highlighted) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group"
          >
            <div className="h-full bg-gradient-to-b from-primary/10 to-card border border-primary/30 rounded-2xl p-8 relative overflow-hidden shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/50 transition-all duration-500">
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
              
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Recomendado
              </div>

              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20 mb-6">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Agência com TravelPro
                </h3>
                <p className="text-muted-foreground mb-6">
                  Potencialize sua agência com o ecossistema completo
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    { text: "Sincronização automática de pacotes", icon: TrendingUp },
                    { text: "Catálogo integrado ao sistema", icon: BarChart3 },
                    { text: "Gestão completa da operação", icon: Users },
                    { text: "Automações e IA incluídas", icon: Sparkles },
                    { text: "Menor custo de divulgação", icon: Zap },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-3 text-muted-foreground">
                      <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                >
                  <Link
                    href="https://travelpro.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Conhecer TravelPro
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
