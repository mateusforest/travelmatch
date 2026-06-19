import { PageHeader } from "@/components/agencia/ui-bits"
import { getMasterAgencies } from "@/lib/data/master"
import { MasterAgenciasClient } from "./agencias-client"

export default async function MasterAgenciasPage() {
  const agencies = await getMasterAgencies()

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Agências"
        description="Gestão completa das agências do marketplace."
      />

      <MasterAgenciasClient agencies={agencies} />
    </div>
  )
}
