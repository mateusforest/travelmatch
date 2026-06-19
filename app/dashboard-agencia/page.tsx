import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  Package,
  Users,
  Eye,
  TrendingUp,
  Plus,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Dashboard da agência | TravelMatch",
  description: "Gerencie seus pacotes, leads e desempenho no TravelMatch.",
}

// Estrutura preparada para integração futura (TravelPro, leads, Match, planos, Stripe).
// Os valores abaixo são placeholders de UI e serão substituídos por dados reais.
const stats = [
  { icon: Eye, label: "Visualizações", value: "—", hint: "últimos 30 dias" },
  { icon: Users, label: "Leads recebidos", value: "—", hint: "últimos 30 dias" },
  { icon: Package, label: "Pacotes ativos", value: "0", hint: "publicados" },
  { icon: TrendingUp, label: "Taxa de conversão", value: "—", hint: "média" },
]

export default function DashboardAgenciaPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" aria-label="TravelMatch - Início">
            <Image
              src="/travelmatch-logo.png"
              alt="TravelMatch"
              width={396}
              height={90}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Configurações">
              <Settings className="w-5 h-5" />
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Sair">
              <Link href="/">
                <LogOut className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Bem-vindo à sua agência
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus pacotes, acompanhe leads e seu desempenho.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            Publicar pacote
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm shadow-black/[0.04]"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-foreground/80 mt-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {stat.hint}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state - packages */}
        <div className="bg-card border border-border rounded-2xl p-10 md:p-14 text-center shadow-sm shadow-black/[0.04]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Comece publicando seu primeiro pacote
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Pacotes publicados aparecem para viajantes compatíveis através do
            Match inteligente do TravelMatch.
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            Publicar pacote
          </Button>
        </div>
      </main>
    </div>
  )
}
