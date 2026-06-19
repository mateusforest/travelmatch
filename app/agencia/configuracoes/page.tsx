"use client"

import { useState } from "react"
import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PageHeader, SectionCard, EmptyState } from "@/components/agencia/ui-bits"

const notificationPrefs = [
  { id: "leads", label: "Novos leads", desc: "Receba um aviso quando um lead chegar." },
  { id: "perf", label: "Resumo de desempenho", desc: "Relatório semanal da sua operação." },
  { id: "cos", label: "Sugestões do COS", desc: "Recomendações para melhorar resultados." },
  { id: "news", label: "Novidades do TravelMatch", desc: "Atualizações e novos recursos." },
]

export default function ConfiguracoesPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    leads: true,
    perf: true,
    cos: true,
    news: false,
  })

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Gerencie os dados, a equipe e as preferências da sua agência."
      />

      <div className="space-y-6">
        <SectionCard
          title="Dados da agência"
          action={
            <Button
              size="sm"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Salvar
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="razao">Razão social</Label>
              <Input id="razao" placeholder="Nome empresarial" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="00.000.000/0000-00" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">E-mail de contato</Label>
              <Input id="email" type="email" placeholder="contato@agencia.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" placeholder="Cidade / UF" className="mt-1.5" />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Equipe"
          action={
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-border hover:border-primary/40"
              disabled
            >
              <Plus className="mr-1.5 h-4 w-4" /> Convidar
            </Button>
          }
        >
          <EmptyState
            icon={Users}
            title="Gestão de equipe em breve"
            description="Em breve você poderá convidar membros e definir permissões para colaborar na sua agência."
          />
        </SectionCard>

        <SectionCard title="Segurança">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="senha-atual">Senha atual</Label>
              <Input id="senha-atual" type="password" placeholder="••••••••" className="mt-1.5" />
            </div>
            <div className="hidden sm:block" />
            <div>
              <Label htmlFor="nova">Nova senha</Label>
              <Input id="nova" type="password" placeholder="••••••••" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="conf">Confirmar nova senha</Label>
              <Input id="conf" type="password" placeholder="••••••••" className="mt-1.5" />
            </div>
          </div>
          <div className="mt-5">
            <Button
              variant="outline"
              className="rounded-full border-border hover:border-primary/40"
            >
              Atualizar senha
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Notificações">
          <div className="divide-y divide-border">
            {notificationPrefs.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-sm text-muted-foreground">{n.desc}</p>
                </div>
                <Switch
                  checked={prefs[n.id]}
                  onCheckedChange={(v) =>
                    setPrefs((p) => ({ ...p, [n.id]: v }))
                  }
                  aria-label={n.label}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  )
}
