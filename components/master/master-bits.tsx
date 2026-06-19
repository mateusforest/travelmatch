import type { LucideIcon } from "lucide-react"
import { Sparkles } from "lucide-react"

export function CosInsights({
  items,
}: {
  items: { text: string; trend?: string }[]
}) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
          <Sparkles className="h-[18px] w-[18px] text-primary" />
        </span>
        <h2 className="text-base font-semibold text-foreground">
          Sugestões do COS
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          Conforme a plataforma recebe dados reais, o COS destacará tendências e
          recomendações estratégicas aqui.
        </p>
      ) : (
      <ul className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5"
          >
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-[11px] font-semibold text-primary">
              {i + 1}
            </span>
            <div>
              <p className="text-sm text-foreground">{item.text}</p>
              {item.trend && (
                <p className="mt-0.5 text-xs font-medium text-primary">
                  {item.trend}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  )
}

export function RankingList({
  items,
}: {
  items: { name: string; value: string; meta?: string }[]
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground">
        Sem dados para exibir ainda.
      </p>
    )
  }
  const max = Math.max(...items.map((i) => Number.parseFloat(i.value.replace(/[^\d.]/g, "")) || 0), 1)
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => {
        const raw = Number.parseFloat(item.value.replace(/[^\d.]/g, "")) || 0
        const pct = Math.round((raw / max) * 100)
        return (
          <li key={i} className="flex items-center gap-3">
            <span className="w-5 text-sm font-semibold text-muted-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </span>
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {item.value}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {item.meta && (
                <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20"
  if (score >= 70) return "text-primary bg-primary/10 ring-primary/20"
  if (score >= 50) return "text-amber-600 bg-amber-500/10 ring-amber-500/20"
  return "text-red-600 bg-red-500/10 ring-red-500/20"
}

export function scoreLabel(score: number) {
  if (score >= 85) return "Excelente operação"
  if (score >= 70) return "Boa operação"
  if (score >= 50) return "Operação regular"
  return "Requer atenção"
}

export function HealthScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${scoreColor(
        score,
      )}`}
    >
      {score}/100
    </span>
  )
}

export function TrendStat({
  icon: Icon,
  label,
  value,
  delta,
  positive = true,
}: {
  icon: LucideIcon
  label: string
  value: string
  delta?: string
  positive?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-black/[0.03]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10">
          <Icon className="h-[18px] w-[18px] text-primary" />
        </span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      {delta && (
        <div
          className={`mt-1 text-xs font-medium ${
            positive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {delta}
        </div>
      )}
    </div>
  )
}
