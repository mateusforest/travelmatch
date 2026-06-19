"use client"

import { useState } from "react"
import {
  Eye,
  MousePointerClick,
  Inbox,
  TrendingUp,
  Sparkles,
  LineChart,
} from "lucide-react"
import { PageHeader, StatCard } from "@/components/agencia/ui-bits"

const periods = ["7 dias", "30 dias", "90 dias"] as const

const stats = [
  { icon: Eye, label: "Visualizações", value: "—", hint: "no período" },
  { icon: MousePointerClick, label: "Cliques", value: "—", hint: "no período" },
  { icon: Inbox, label: "Leads", value: "—", hint: "no período" },
  { icon: TrendingUp, label: "Conversões", value: "—", hint: "no período" },
]

const charts = [
  "Visualizações por período",
  "Leads por período",
  "Pacotes mais acessados",
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("30 dias")

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Entenda como sua agência está performando no TravelMatch."
        action={
          <div className="inline-flex rounded-full border border-border bg-card p-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {charts.map((title, i) => (
          <div
            key={title}
            className={`rounded-2xl border border-border bg-card p-5 shadow-sm shadow-black/[0.03] ${
              i === 2 ? "lg:col-span-2" : ""
            }`}
          >
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <div className="mt-4 flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 text-center">
              <span className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-primary/10">
                <LineChart className="h-5 w-5 text-primary" />
              </span>
              <p className="text-sm font-medium text-foreground">
                Sem dados no período
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Os gráficos serão preenchidos conforme sua operação evolui.
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* COS insight */}
      <section className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.06] to-card p-5 shadow-sm shadow-black/[0.03]">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15">
            <Sparkles className="h-[18px] w-[18px] text-primary" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Insights do COS
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              Assim que houver dados suficientes, o COS destacará tendências como
              {" "}
              <span className="text-foreground">
                &quot;o pacote X recebeu 34% mais visitas nesta semana&quot;
              </span>{" "}
              e recomendações para aumentar seus resultados.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
