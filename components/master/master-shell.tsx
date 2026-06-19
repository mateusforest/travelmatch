import { MasterShellClient } from "@/components/master/master-shell-client"
import { getMasterTopbarData } from "@/lib/data/topbar"

export async function MasterShell({ children }: { children: React.ReactNode }) {
  const topbar = await getMasterTopbarData()

  return (
    <MasterShellClient
      email={topbar.email}
      notifications={topbar.notifications}
    >
      {children}
    </MasterShellClient>
  )
}
