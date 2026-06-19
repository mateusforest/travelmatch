import type { Metadata } from "next"
import { MasterShell } from "@/components/master/master-shell"

export const metadata: Metadata = {
  title: "Portal Master | TravelMatch",
  description: "Centro de gestão e inteligência do marketplace TravelMatch.",
}

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MasterShell>{children}</MasterShell>
}
