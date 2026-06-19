import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader, SectionCard } from "@/components/agencia/ui-bits"
import { getAgencyPackageDetails } from "@/lib/data/agency"
import { formatCurrencyBRL, formatDateBR } from "@/lib/format"

export default async function PacoteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pkg = await getAgencyPackageDetails(id)

  if (!pkg) {
    notFound()
  }

  return (
    <>
      <Link
        href="/agencia/pacotes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para pacotes
      </Link>

      <PageHeader
        title={pkg.title}
        description="Detalhes do pacote cadastrado na sua agência."
        action={
          <Button
            asChild
            className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
          >
            <Link href={`/agencia/pacotes/${pkg.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Descrição">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {pkg.description}
            </p>
          </SectionCard>
        </div>
        <SectionCard title="Informações">
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {pkg.destination}
            </p>
            <p className="text-muted-foreground">Categoria: {pkg.category_name}</p>
            <p className="text-muted-foreground">Preço: {formatCurrencyBRL(pkg.price_from)}</p>
            <p className="text-muted-foreground">
              Duração: {pkg.duration_days ? `${pkg.duration_days} dias` : "Sob consulta"}
            </p>
            <p className="text-muted-foreground">Status: {pkg.status}</p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              Criado em {formatDateBR(pkg.created_at)}
            </p>
          </div>
        </SectionCard>
      </div>
    </>
  )
}
