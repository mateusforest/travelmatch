import { PageHeader, SectionCard } from "@/components/agencia/ui-bits"
import { getMasterAgencies, getMasterAuditLogs } from "@/lib/data/master"
import { MasterAgenciasClient } from "./agencias-client"

export default async function MasterAgenciasPage() {
  const [agencies, auditLogs] = await Promise.all([
    getMasterAgencies(),
    getMasterAuditLogs(),
  ])

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Agências"
        description="Gestão completa das agências do marketplace."
      />

      <MasterAgenciasClient agencies={agencies} />

      <div className="mt-6">
        <SectionCard title="Auditoria recente">
          {auditLogs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground">
              Sem eventos de auditoria ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-sm"
                >
                  <span className="text-foreground">{log.action}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {log.entityType} · {log.createdAt}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
