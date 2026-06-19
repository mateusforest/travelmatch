"use client"

import Link from "next/link"
import Image from "next/image"
import { Instagram, Mail, HelpCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/20">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Symbol */}
          <Link href="/" className="flex items-center" aria-label="TravelMatch - Início">
            <Image
              src="/travelmatch-symbol.png"
              alt="TravelMatch"
              width={120}
              height={104}
              className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/termos" className="hover:text-foreground transition-colors">
              Termos de uso
            </Link>
            <Link href="/privacidade" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
            <Link href="/contato" className="hover:text-foreground transition-colors">
              Contato
            </Link>
            <Link href="/suporte" className="hover:text-foreground transition-colors">
              Suporte
            </Link>
            <Link
              href="https://travelpro.com.br"
              target="_blank"
              className="hover:text-primary transition-colors"
            >
              TravelPro
            </Link>
          </nav>

          {/* Social */}
          <div className="flex items-center gap-4">
            <Link
              href="https://instagram.com/travelpro"
              target="_blank"
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
            >
              <Instagram className="w-5 h-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link
              href="mailto:contato@travelpromatch.com.br"
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
            >
              <Mail className="w-5 h-5" />
              <span className="sr-only">Email</span>
            </Link>
            <Link
              href="/ajuda"
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="sr-only">Ajuda</span>
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TravelMatch. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
