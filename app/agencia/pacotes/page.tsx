"use client"

import Link from "next/link"
import { Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader, EmptyState } from "@/components/agencia/ui-bits"
import {
  PackageCard,
  type AgencyPackage,
} from "@/components/agencia/package-card"

export default function PacotesPage() {
  // Estrutura pronta para dados reais. Sem mocks permanentes — inicia vazio.
  const packages: AgencyPackage[] = []

  return (
    <>
      <PageHeader
        title="Pacotes"
        description="Crie e gerencie os pacotes que sua agência oferece."
        action={
          <Button
            asChild
            className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/agencia/pacotes/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo pacote
            </Link>
          </Button>
        }
      />

      {packages.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03]">
          <EmptyState
            icon={Package}
            title="Você ainda não tem pacotes"
            description="Crie seu primeiro pacote e comece a aparecer para viajantes compatíveis através do Match inteligente do TravelMatch."
            action={
              <Button
                asChild
                className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/agencia/pacotes/novo">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar pacote
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </>
  )
}
