"use client"

import type React from "react"
import Image from "next/image"
import { Search, ArrowRight, Sparkles, MapPin, Globe, Heart, Users, Ship, Tag, X } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { destinationSuggestions } from "@/lib/travel-suggestions"

const quickCategories = [
  { label: "Disney", icon: Sparkles },
  { label: "Nacional", icon: MapPin },
  { label: "Internacional", icon: Globe },
  { label: "Lua de mel", icon: Heart },
  { label: "Família", icon: Users },
  { label: "Cruzeiros", icon: Ship },
  { label: "Promoções", icon: Tag },
]

interface HeroSectionProps {
  variant?: "initial" | "result"
  query: string
  setQuery: (value: string) => void
  onSearch: (value?: string) => void
  onReset: () => void
}

export function HeroSection({ variant = "initial", query, setQuery, onSearch, onReset }: HeroSectionProps) {
  const isResult = variant === "result"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <section
      id="destinos"
      className={`relative overflow-hidden ${
        isResult ? "pt-28 pb-10 md:pt-32 md:pb-12" : "pt-24 pb-12 md:pt-28 md:pb-16"
      }`}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        {isResult ? (
          /* ---------------- RESULT HERO (compact) ---------------- */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl ml-auto lg:pr-6 pt-4"
          >
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-5 text-balance leading-[1.15]">
              A viagem que você procura, <span className="text-primary">encontramos.</span>
            </h1>
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center bg-card border border-border rounded-2xl overflow-hidden shadow-lg shadow-black/[0.06]">
                <div className="flex items-center pl-5 pr-3">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Para onde você quer ir?"
                    list="travelmatch-destinations"
                    className="flex-1 py-3.5 pr-3 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-base"
                />
                {query && (
                  <button
                    type="button"
                    onClick={onReset}
                    aria-label="Limpar busca"
                    className="mr-1 p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="pr-2">
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl w-11 h-11"
                    aria-label="Buscar"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          /* ---------------- INITIAL HERO (two columns) ---------------- */
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-lg lg:pl-6 lg:pt-16"
            >
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4 text-balance leading-[1.15]">
                A viagem que você procura, <span className="text-primary">encontramos.</span>
              </h1>
              <p className="text-base text-muted-foreground mb-7 text-pretty leading-relaxed">
                Conectamos você às melhores agências e pacotes com o match ideal para o seu sonho.
              </p>

              {/* Search */}
              <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/[0.06] ring-1 ring-black/[0.02]">
                  <div className="flex items-center pl-5 pr-3">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Para onde você quer ir?"
                    list="travelmatch-destinations"
                    className="flex-1 py-4 pr-3 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-base"
                  />
                  <div className="pr-2">
                    <Button
                      type="submit"
                      size="icon"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl w-11 h-11"
                      aria-label="Buscar viagens"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </form>

              {/* Quick categories */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-x-4 gap-y-4 mt-7"
              >
                {quickCategories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => onSearch(cat.label)}
                    className="group/chip flex flex-col items-center gap-1.5 text-center"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-sm text-muted-foreground group-hover/chip:text-primary group-hover/chip:border-primary/40 group-hover/chip:shadow-md transition-all duration-300">
                      <cat.icon className="w-[18px] h-[18px]" />
                    </span>
                    <span className="text-[11px] text-muted-foreground group-hover/chip:text-foreground transition-colors">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - plane window image + social proof */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative mx-auto w-[380px] h-[480px]">
                {/* Window frame */}
                <div className="absolute inset-0 rounded-[140px] bg-card shadow-2xl shadow-black/10 ring-1 ring-border p-4">
                  <div className="relative w-full h-full rounded-[120px] overflow-hidden">
                    <Image
                      src="/hero-plane-window.png"
                      alt="Vista de uma cidade litorânea pela janela do avião ao pôr do sol"
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </div>
      <datalist id="travelmatch-destinations">
        {destinationSuggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </section>
  )
}


