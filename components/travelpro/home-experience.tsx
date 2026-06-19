"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { HeroSection } from "@/components/travelpro/hero-section"
import { CategoriesSection } from "@/components/travelpro/categories-section"
import { AgenciesSection } from "@/components/travelpro/agencies-section"
import { FeaturedAgenciesStrip } from "@/components/travelpro/featured-agencies-strip"
import { BenefitsSection } from "@/components/travelpro/benefits-section"
import { ResultsSection } from "@/components/travelpro/results-section"
import { SpecialistsSection } from "@/components/travelpro/specialists-section"
import { registerMatchSearch } from "@/app/actions/public"

const fade = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
}

export function HomeExperience() {
  const [query, setQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = (value?: string) => {
    const next = (value ?? query).trim()
    if (!next) return
    setQuery(next)
    setHasSearched(true)
    void registerMatchSearch({ search_term: next })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleReset = () => {
    setHasSearched(false)
    setQuery("")
  }

  return (
    <>
      <HeroSection
        variant={hasSearched ? "result" : "initial"}
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <AnimatePresence mode="wait">
        {hasSearched ? (
          <motion.div key="results" {...fade}>
            <ResultsSection query={query} />
            <SpecialistsSection />
            <FeaturedAgenciesStrip />
          </motion.div>
        ) : (
          <motion.div key="discovery" {...fade}>
            <CategoriesSection />
            <AgenciesSection />
            <FeaturedAgenciesStrip />
            <BenefitsSection />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
