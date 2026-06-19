"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps, ReactNode } from "react"
import { registerCtaEvent } from "@/app/actions/public"

type TrackedLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode
  packageId?: string | null
  agencyId?: string | null
  eventType: string
  ctaLabel?: string | null
}

export function TrackedLink({
  children,
  packageId,
  agencyId,
  eventType,
  ctaLabel,
  onClick,
  ...props
}: TrackedLinkProps) {
  const pathname = usePathname()

  return (
    <Link
      {...props}
      onClick={(event) => {
        void registerCtaEvent({
          package_id: packageId,
          agency_id: agencyId,
          event_type: eventType,
          cta_label: ctaLabel,
          source_page: pathname,
        })
        onClick?.(event)
      }}
    >
      {children}
    </Link>
  )
}
