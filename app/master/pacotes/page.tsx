import { PageHeader } from "@/components/agencia/ui-bits"
import { getMasterPackages } from "@/lib/data/master"
import { MasterPacotesClient } from "./pacotes-client"

export default async function MasterPacotesPage() {
  const packages = await getMasterPackages()

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Pacotes"
        description="Gestão global e moderação de todos os pacotes da plataforma."
      />

      <MasterPacotesClient packages={packages} />
    </div>
  )
}
