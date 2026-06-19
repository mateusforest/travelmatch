import { notFound } from "next/navigation"
import { PageHeader } from "@/components/agencia/ui-bits"
import { getAgencyLeadDetails } from "@/lib/data/agency"
import { LeadDetailClient } from "./lead-detail-client"

export default async function AgencyLeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lead = await getAgencyLeadDetails(id)

  if (!lead) {
    notFound()
  }

  return (
    <>
      <PageHeader
        title="Detalhe do lead"
        description="Dados completos, pipeline e historico de relacionamento."
      />

      <LeadDetailClient lead={lead} />
    </>
  )
}
