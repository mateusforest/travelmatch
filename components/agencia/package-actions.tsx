"use client"

import { useTransition } from "react"
import Link from "next/link"
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Archive,
  Trash2,
  CheckCircle2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  deleteAgencyPackage,
  setAgencyPackageStatus,
} from "@/app/actions/packages"
import type { AgencyPackage } from "@/components/agencia/package-card"

export function PackageActions({ pkg }: { pkg: AgencyPackage }) {
  const [pending, startTransition] = useTransition()
  const nextStatus = pkg.status === "Publicado" ? "draft" : "published"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="grid h-8 w-8 place-items-center rounded-full bg-card/90 text-foreground backdrop-blur-md transition-colors hover:bg-card"
        aria-label="Ações do pacote"
        disabled={pending}
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/agencia/pacotes/${pkg.id}`}>
            <Eye className="mr-2 h-4 w-4" /> Visualizar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/agencia/pacotes/${pkg.id}/editar`}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            startTransition(() => {
              void setAgencyPackageStatus(pkg.id, nextStatus)
            })
          }}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {pkg.status === "Publicado" ? "Salvar rascunho" : "Publicar"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            startTransition(() => {
              void setAgencyPackageStatus(pkg.id, "draft")
            })
          }}
        >
          <Archive className="mr-2 h-4 w-4" /> Arquivar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(event) => {
            event.preventDefault()
            startTransition(() => {
              void deleteAgencyPackage(pkg.id)
            })
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
