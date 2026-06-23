"use client"

import { useState } from "react"

type AgencyLogoProps = {
  src?: string | null
  name: string
  className?: string
}

export function AgencyLogo({
  src,
  name,
  className = "",
}: AgencyLogoProps) {
  const [failed, setFailed] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || "T"
  const logoSrc = src && !failed ? src : null
  const hasLogo = Boolean(logoSrc)

  return (
    <div className={`grid place-items-center overflow-hidden ${hasLogo ? "bg-transparent" : "bg-primary/10"} ${className}`}>
      {hasLogo ? (
        <img
          src={logoSrc ?? undefined}
          alt={name}
          className="block h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-lg font-semibold text-primary">{initial}</span>
      )}
    </div>
  )
}
