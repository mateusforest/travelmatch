"use client"

import Image from "next/image"
import { Eye, Inbox, Star } from "lucide-react"
import { PackageActions } from "@/components/agencia/package-actions"

export type AgencyPackage = {
  id: string
  title: string
  destination: string
  price: string
  match: number
  views: number
  leads: number
  status: "Publicado" | "Rascunho" | "Arquivado"
  image?: string
}

const statusStyles: Record<AgencyPackage["status"], string> = {
  Publicado: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Rascunho: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Arquivado: "bg-secondary text-muted-foreground border-border",
}

export function PackageCard({ pkg }: { pkg: AgencyPackage }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03] transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <div className="relative aspect-[16/10] bg-secondary">
        {pkg.image && (
          <Image
            src={pkg.image || "/placeholder.svg"}
            alt={pkg.title}
            fill
            className="object-cover"
          />
        )}
        <span
          className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[pkg.status]}`}
        >
          {pkg.status}
        </span>
        <div className="absolute right-3 top-3">
          <PackageActions pkg={pkg} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">
              {pkg.title}
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {pkg.destination}
            </p>
          </div>
          <span className="shrink-0 text-right text-sm font-semibold text-foreground">
            {pkg.price}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-primary" /> {pkg.match}% match
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {pkg.views}
          </span>
          <span className="inline-flex items-center gap-1">
            <Inbox className="h-3.5 w-3.5" /> {pkg.leads}
          </span>
        </div>
      </div>
    </div>
  )
}
