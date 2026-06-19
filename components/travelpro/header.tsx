"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Destinos", href: "#destinos" },
  { label: "Pacotes", href: "#pacotes" },
  { label: "Agências", href: "#agencias" },
  { label: "Experiências", href: "#experiencias" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 md:pt-4">
      <div
        className={`container mx-auto px-4 lg:px-6 rounded-full transition-all duration-500 ${
          isScrolled
            ? "bg-white/70 backdrop-blur-xl border border-border shadow-lg shadow-black/[0.03]"
            : "bg-white/40 backdrop-blur-md border border-white/40"
        }`}
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="TravelMatch - Início">
            <Image
              src="/travelmatch-logo.png"
              alt="TravelMatch"
              width={440}
              height={100}
              priority
              className="h-9 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              href="/entrar"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Entrar
            </Link>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-medium"
            >
              <Link href="/divulgar-pacotes">Divulgar meus pacotes</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mt-3"
          >
            <div className="container mx-auto bg-white/90 backdrop-blur-xl border border-border rounded-3xl shadow-lg shadow-black/[0.04] px-6 py-6">
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-foreground py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <hr className="border-border my-2" />
                <Link
                  href="/entrar"
                  className="text-foreground py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full mt-2"
                >
                  <Link
                    href="/divulgar-pacotes"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Divulgar meus pacotes
                  </Link>
                </Button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
