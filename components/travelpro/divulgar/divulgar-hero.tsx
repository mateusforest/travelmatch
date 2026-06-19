"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DivulgarHero() {
  return (
    <section className="relative pt-36 md:pt-44 pb-20 md:pb-28 overflow-hidden">
      {/* Soft light gradient + orange glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-background to-background pointer-events-none" />
      <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[700px] h-[480px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
              TravelMatch para agências
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance mb-6">
              Transforme seus pacotes em novas{" "}
              <span className="text-primary">oportunidades</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty mb-10">
              Publique seus pacotes, receba leads qualificados e alcance
              viajantes que realmente procuram o que você oferece.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-12 text-base font-medium border-border bg-card hover:bg-secondary"
              >
                <Link href="#planos">Conhecer planos</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
