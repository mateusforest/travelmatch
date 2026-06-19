"use client"

import { useEffect } from "react"
import { registerAgencyProfileView, registerPackageView } from "@/app/actions/public"

export function PackageViewTracker({
  packageId,
  agencyId,
}: {
  packageId: string
  agencyId: string
}) {
  useEffect(() => {
    void registerPackageView({ package_id: packageId, agency_id: agencyId })
  }, [agencyId, packageId])

  return null
}

export function AgencyViewTracker({ agencyId }: { agencyId: string }) {
  useEffect(() => {
    void registerAgencyProfileView(agencyId)
  }, [agencyId])

  return null
}
