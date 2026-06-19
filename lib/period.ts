export type AnalyticsPeriod =
  | "today"
  | "7d"
  | "30d"
  | "90d"
  | "month"
  | "12m"
  | "custom"

export type PeriodRange = {
  period: AnalyticsPeriod
  from: string
  to: string
}

export function getPeriodRange(period?: string | null, from?: string | null, to?: string | null): PeriodRange {
  const now = new Date()
  const selected = (period || "30d") as AnalyticsPeriod
  const start = new Date(now)

  if (selected === "today") {
    start.setHours(0, 0, 0, 0)
  } else if (selected === "7d") {
    start.setDate(start.getDate() - 7)
  } else if (selected === "90d") {
    start.setDate(start.getDate() - 90)
  } else if (selected === "month") {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
  } else if (selected === "12m") {
    start.setFullYear(start.getFullYear() - 1)
  } else if (selected === "custom" && from && to) {
    return {
      period: selected,
      from: new Date(from).toISOString(),
      to: new Date(to).toISOString(),
    }
  } else {
    start.setDate(start.getDate() - 30)
  }

  return {
    period: selected,
    from: start.toISOString(),
    to: now.toISOString(),
  }
}

export const analyticsPeriods = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
  { label: "Este mes", value: "month" },
  { label: "12 meses", value: "12m" },
] as const
