import { AgenciaShellClient } from "@/components/agencia/agencia-shell-client"
import { getAgencyTopbarData } from "@/lib/data/topbar"

export async function AgenciaShell({ children }: { children: React.ReactNode }) {
  const topbar = await getAgencyTopbarData()

  return (
    <AgenciaShellClient
      email={topbar.email}
      notifications={topbar.notifications}
    >
      {children}
    </AgenciaShellClient>
  )
}
