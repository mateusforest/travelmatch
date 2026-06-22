"use client"

import { useState } from "react"

type AgencyLogoImageProps = {
  src?: string | null
  name: string
  className?: string
  imageClassName?: string
}

export function AgencyLogoImage({
  src,
  name,
  className = "",
  imageClassName = "",
}: AgencyLogoImageProps) {
  const [failed, setFailed] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || "T"

  return (
    <div className={`grid place-items-center overflow-hidden bg-primary/10 ${className}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          className={`h-full w-full object-contain ${imageClassName}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-lg font-semibold text-primary">{initial}</span>
      )}
    </div>
  )
}
