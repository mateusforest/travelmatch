import { redirect } from "next/navigation"
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server"
import { formatCurrencyBRL } from "@/lib/format"
import {
  formatAnalyticsLevel,
  formatBillingStatus,
  formatGateway,
  formatProductType,
  formatPromotionType,
} from "@/lib/billing-labels"

type PlanRow = {
  id: string
  slug: string
  name: string
  price: number
  package_limit: number | null
  analytics_level: string
  priority_level: number
}

type SubscriptionRow = {
  id: string
  status: string
  started_at: string
  expires_at: string | null
  subscription_plans: PlanRow[] | null
}

export type AgencyBillingData = {
  planName: string
  planSlug: string
  status: string
  renewalDate: string
  packageUsage: string
  analyticsLevel: string
  packageLimit: number | null
  plans: {
    slug: string
    name: string
    price: string
    packageLimit: string
    analyticsLevel: string
    current: boolean
  }[]
  promotions: { type: string; status: string; amount: string; period: string; reportUrl?: string | null }[]
  payments: { product: string; status: string; amount: string; createdAt: string; gateway: string; invoiceUrl?: string | null }[]
}

export type MasterFinanceData = {
  activeSubscriptions: number
  mrr: string
  arr: string
  sponsoredRevenue: string
  upgrades: number
  cancellations: number
  activePromotions: number
  confirmedRevenue: string
  pendingRevenue: string
  revenueByPlan: { name: string; value: string; meta?: string }[]
  history: { title: string; desc: string; value: string; when: string }[]
}

async function getCurrentUserAgencyId() {
  if (!hasSupabaseEnv()) return null
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/entrar")

  const { data } = await supabase
    .from("agency_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  return data?.id as string | undefined
}

export async function getAgencyBillingData(): Promise<AgencyBillingData> {
  const agencyId = await getCurrentUserAgencyId()
  const fallback: AgencyBillingData = {
    planName: "Free",
    planSlug: "free",
    status: "Ativo",
    renewalDate: "sem renovação",
    packageUsage: "0 / 3",
    analyticsLevel: "Básico",
    packageLimit: 3,
    plans: [],
    promotions: [],
    payments: [],
  }

  if (!agencyId) return fallback

  const supabase = await createSupabaseServerClient()
  const [
    { data: plans },
    { data: subscription },
    { count: publishedPackages },
    { data: promotions },
    { data: payments },
  ] = await Promise.all([
    supabase
      .from("subscription_plans")
      .select("id,slug,name,price,package_limit,analytics_level,priority_level")
      .eq("active", true)
      .order("price", { ascending: true }),
    supabase
      .from("agency_subscriptions")
      .select("id,status,started_at,expires_at,subscription_plans(id,slug,name,price,package_limit,analytics_level,priority_level)")
      .eq("agency_id", agencyId)
      .in("status", ["trial", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("packages")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .eq("status", "published"),
    supabase
      .from("agency_promotions")
      .select("type,status,amount,starts_at,ends_at,created_at,campaign_report_url")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("payment_intents")
      .select("product_type,status,amount,created_at,gateway,checkout_url")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const planRows = (plans ?? []) as PlanRow[]
  const subscriptionRow = subscription as SubscriptionRow | null
  const currentPlan = subscriptionRow?.subscription_plans?.[0] ?? planRows.find((plan) => plan.slug === "free")

  if (!currentPlan) return fallback

  return {
    planName: currentPlan.name,
    planSlug: currentPlan.slug,
    status: formatBillingStatus(subscriptionRow?.status ?? "active"),
    renewalDate: subscriptionRow?.expires_at
      ? new Date(subscriptionRow.expires_at).toLocaleDateString("pt-BR")
      : "sem renovação",
    packageUsage: `${publishedPackages ?? 0} / ${currentPlan.package_limit ?? "Ilimitado"}`,
    analyticsLevel: formatAnalyticsLevel(currentPlan.analytics_level),
    packageLimit: currentPlan.package_limit,
    plans: planRows.map((plan) => ({
      slug: plan.slug,
      name: plan.name,
      price: plan.price === 0 ? "R$ 0" : formatCurrencyBRL(plan.price),
      packageLimit: plan.package_limit ? `${plan.package_limit} pacotes` : "Pacotes ilimitados",
      analyticsLevel: formatAnalyticsLevel(plan.analytics_level),
      current: plan.slug === currentPlan.slug,
    })),
    promotions: ((promotions ?? []) as {
      type: string
      status: string
      amount: number
      starts_at: string | null
      ends_at: string | null
      campaign_report_url?: string | null
    }[]).map((promotion) => ({
      type: formatPromotionType(promotion.type),
      status: formatBillingStatus(promotion.status),
      amount: formatCurrencyBRL(Number(promotion.amount ?? 0)),
      period: promotion.ends_at
        ? `Até ${new Date(promotion.ends_at).toLocaleDateString("pt-BR")}`
        : promotion.starts_at
          ? `Desde ${new Date(promotion.starts_at).toLocaleDateString("pt-BR")}`
          : "Aguardando ativação",
      reportUrl: promotion.campaign_report_url,
    })),
    payments: ((payments ?? []) as {
      product_type: string
      status: string
      amount: number
      created_at: string
      gateway?: string | null
      checkout_url?: string | null
    }[]).map((payment) => ({
      product: formatProductType(payment.product_type),
      status: formatBillingStatus(payment.status),
      amount: formatCurrencyBRL(Number(payment.amount ?? 0)),
      createdAt: new Date(payment.created_at).toLocaleDateString("pt-BR"),
      gateway: formatGateway(payment.gateway),
      invoiceUrl: payment.checkout_url,
    })),
  }
}

export async function getMasterFinanceData(): Promise<MasterFinanceData> {
  if (!hasSupabaseEnv()) {
    return {
      activeSubscriptions: 0,
      mrr: "R$ 0",
      arr: "R$ 0",
      sponsoredRevenue: "R$ 0",
      confirmedRevenue: "R$ 0",
      pendingRevenue: "R$ 0",
      upgrades: 0,
      cancellations: 0,
      activePromotions: 0,
      revenueByPlan: [],
      history: [],
    }
  }

  const supabase = await createSupabaseServerClient()
  const [
    { data: subscriptions },
    { data: promotions },
    { data: payments },
    { count: cancellations },
  ] = await Promise.all([
    supabase
      .from("agency_subscriptions")
      .select("status,created_at,subscription_plans(name,price)")
      .in("status", ["trial", "active"]),
    supabase
      .from("agency_promotions")
      .select("type,status,amount,created_at")
      .in("status", ["active", "completed"]),
    supabase
      .from("payment_intents")
      .select("product_type,status,amount,created_at,gateway")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("agency_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "canceled"),
  ])

  const subscriptionRows = (subscriptions ?? []) as {
    status: string
    created_at: string
    subscription_plans?: { name: string; price: number }[] | null
  }[]
  const promotionRows = (promotions ?? []) as { type: string; status: string; amount: number; created_at: string }[]
  const paymentRows = (payments ?? []) as {
    product_type: string
    status: string
    amount: number
    created_at: string
    gateway?: string | null
  }[]
  const mrrNumber = subscriptionRows.reduce((total, row) => total + Number(row.subscription_plans?.[0]?.price ?? 0), 0)
  const sponsoredNumber = promotionRows.reduce((total, row) => total + Number(row.amount ?? 0), 0)
  const confirmedRevenue = paymentRows
    .filter((row) => row.status === "paid")
    .reduce((total, row) => total + Number(row.amount ?? 0), 0)
  const pendingRevenue = paymentRows
    .filter((row) => row.status === "pending")
    .reduce((total, row) => total + Number(row.amount ?? 0), 0)
  const planMap = new Map<string, number>()
  for (const row of subscriptionRows) {
    const plan = row.subscription_plans?.[0]
    if (!plan) continue
    planMap.set(plan.name, (planMap.get(plan.name) ?? 0) + Number(plan.price ?? 0))
  }

  return {
    activeSubscriptions: subscriptionRows.length,
    mrr: formatCurrencyBRL(mrrNumber),
    arr: formatCurrencyBRL(mrrNumber * 12),
    sponsoredRevenue: formatCurrencyBRL(sponsoredNumber),
    confirmedRevenue: formatCurrencyBRL(confirmedRevenue),
    pendingRevenue: formatCurrencyBRL(pendingRevenue),
    upgrades: subscriptionRows.filter((row) => Number(row.subscription_plans?.[0]?.price ?? 0) > 0).length,
    cancellations: cancellations ?? 0,
    activePromotions: promotionRows.filter((row) => row.status === "active").length,
    revenueByPlan: Array.from(planMap.entries()).map(([name, value]) => ({
      name,
      value: formatCurrencyBRL(value),
    })),
    history: [
      ...paymentRows.slice(0, 4).map((row) => ({
        title: row.status === "paid" ? "Pagamento confirmado" : "Pagamento",
        desc: `${formatProductType(row.product_type)} · ${formatBillingStatus(row.status)} · ${formatGateway(row.gateway)}`,
        value: formatCurrencyBRL(Number(row.amount ?? 0)),
        when: new Date(row.created_at).toLocaleDateString("pt-BR"),
      })),
      ...subscriptionRows.slice(0, 4).map((row) => ({
        title: "Assinatura ativa",
        desc: row.subscription_plans?.[0]?.name ?? "Plano",
        value: formatCurrencyBRL(Number(row.subscription_plans?.[0]?.price ?? 0)),
        when: new Date(row.created_at).toLocaleDateString("pt-BR"),
      })),
      ...promotionRows.slice(0, 4).map((row) => ({
        title: "Promoção",
        desc: `${formatPromotionType(row.type)} · ${formatBillingStatus(row.status)}`,
        value: formatCurrencyBRL(Number(row.amount ?? 0)),
        when: new Date(row.created_at).toLocaleDateString("pt-BR"),
      })),
    ].slice(0, 6),
  }
}
