"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Plataforma 0km: série temporal zerada até haver tráfego e leads reais.
const data = [
  { month: "Jan", visitantes: 0, leads: 0 },
  { month: "Fev", visitantes: 0, leads: 0 },
  { month: "Mar", visitantes: 0, leads: 0 },
  { month: "Abr", visitantes: 0, leads: 0 },
  { month: "Mai", visitantes: 0, leads: 0 },
  { month: "Jun", visitantes: 0, leads: 0 },
]

export function AnalyticsChart() {
  const hasData = data.some((d) => d.visitantes > 0 || d.leads > 0)
  if (!hasData) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 text-center">
        <p className="text-sm font-medium text-foreground">Sem dados no período</p>
        <p className="mt-1 text-xs text-muted-foreground">
          O gráfico será preenchido conforme a plataforma registrar visitantes e leads.
        </p>
      </div>
    )
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="fillVisitantes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-foreground)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--color-foreground)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
              color: "var(--color-foreground)",
              fontSize: 13,
            }}
            labelStyle={{ color: "var(--color-muted-foreground)" }}
          />
          <Area
            type="monotone"
            dataKey="visitantes"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#fillVisitantes)"
          />
          <Area
            type="monotone"
            dataKey="leads"
            stroke="var(--color-foreground)"
            strokeWidth={2}
            fill="url(#fillLeads)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
