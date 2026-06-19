import { PageHeader } from "@/components/agencia/ui-bits"
import { getAgencyLeads } from "@/lib/data/agency"
import { LeadsClient } from "./leads-client"

export default async function LeadsPage() {
  const leads = await getAgencyLeads()

  return (
    <>
      <PageHeader
        title="Leads"
        description="Acompanhe e responda aos interessados nos seus pacotes."
      />

      <LeadsClient leads={leads} />
    </>
  )
}
