import { notFound } from "next/navigation"
import { PackageForm } from "../../package-form"
import { getAgencyPackageDetails } from "@/lib/data/agency"

export default async function EditarPacotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pkg = await getAgencyPackageDetails(id)

  if (!pkg) {
    notFound()
  }

  return <PackageForm pkg={pkg} />
}
