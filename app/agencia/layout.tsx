import type { Metadata } from "next"
import { AgenciaShell } from "@/components/agencia/agencia-shell"

export const metadata: Metadata = {
  title: "Portal da Agência | TravelMatch",
  description:
    "Crie pacotes, gerencie leads, edite seu perfil público e acompanhe o desempenho da sua agência no TravelMatch.",
}

export default function AgenciaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AgenciaShell>{children}</AgenciaShell>
}
