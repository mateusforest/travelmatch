"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowLeft, Plane, MapPin, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
        
        {/* Abstract Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating Particles */}
        <motion.div
          animate={{ y: [-20, 20, -20], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-2 h-2 bg-primary/40 rounded-full"
        />
        <motion.div
          animate={{ y: [20, -20, 20], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-primary/30 rounded-full"
        />
        <motion.div
          animate={{ y: [-15, 15, -15], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-[20%] w-1 h-1 bg-primary/50 rounded-full"
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-6 lg:p-8">
        <div className="container mx-auto flex items-center justify-between">
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
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative">
          <div className="max-w-lg">
            {/* Floating Icons */}
            <motion.div
              animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-32 left-20 p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50"
            >
              <Plane className="w-6 h-6 text-primary" />
            </motion.div>
            <motion.div
              animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-48 right-12 p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50"
            >
              <MapPin className="w-6 h-6 text-primary" />
            </motion.div>
            <motion.div
              animate={{ y: [-8, 8, -8], rotate: [0, 3, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-40 left-16 p-3 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50"
            >
              <Compass className="w-6 h-6 text-primary" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-5xl font-semibold text-foreground leading-tight tracking-tight text-balance">
                Seu próximo destino começa{" "}
                <span className="text-primary">aqui</span>.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Acesse sua conta e continue explorando experiências únicas no TravelMatch.
              </p>

              {/* Trust Badges */}
              <div className="mt-12 flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Dados protegidos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>+500 agências</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Match inteligente</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Mobile Headline */}
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-2xl font-semibold text-foreground leading-tight">
                Seu próximo destino começa{" "}
                <span className="text-primary">aqui</span>.
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Acesse sua conta e continue explorando experiências únicas.
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground">Entrar</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Bem-vindo de volta ao TravelMatch
                </p>
              </div>

              <form className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-secondary/50 border-border/50 rounded-xl placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-secondary/50 border-border/50 rounded-xl placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link
                    href="/recuperar-senha"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  asChild
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-base transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <Link href="/agencia">Entrar</Link>
                </Button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">ou</span>
                  </div>
                </div>

                {/* Google Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-transparent border-border/50 hover:bg-secondary/50 rounded-xl font-medium transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar com Google
                </Button>
              </form>

              {/* Create Account */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Novo no TravelMatch?{" "}
                  <Link
                    href="/cadastro-agencia"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <p className="mt-6 text-center text-xs text-muted-foreground/60">
              Ao continuar, você concorda com nossos{" "}
              <Link href="/termos" className="underline hover:text-muted-foreground">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link href="/privacidade" className="underline hover:text-muted-foreground">
                Política de Privacidade
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
