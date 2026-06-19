import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server"

export type TopbarNotification = {
  title: string
  description: string
  href: string
}

export type TopbarData = {
  email: string
  notifications: TopbarNotification[]
}

function formatDate(value: string | null | undefined) {
  if (!value) return "sem data"
  return new Date(value).toLocaleDateString("pt-BR")
}

export async function getAgencyTopbarData(): Promise<TopbarData> {
  if (!hasSupabaseEnv()) return { email: "", notifications: [] }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { email: "", notifications: [] }

  const { data: agency } = await supabase
    .from("agency_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!agency) return { email: user.email ?? "", notifications: [] }

  const now = new Date()
  const dayAgo = new Date(now)
  dayAgo.setHours(dayAgo.getHours() - 24)
  const threeDaysAgo = new Date(now)
  threeDaysAgo.setHours(threeDaysAgo.getHours() - 72)
  const nextSevenDays = new Date(now)
  nextSevenDays.setDate(nextSevenDays.getDate() + 7)

  const [
    { count: newLeads },
    { count: unansweredNew },
    { count: staleContacted },
    { data: payments },
    { data: subscription },
    { count: reviews },
    { data: expiringPromotions },
  ] = await Promise.all([
    supabase
      .from("traveler_leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .eq("status", "new"),
    supabase
      .from("traveler_leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .eq("status", "new")
      .lt("created_at", dayAgo.toISOString())
      .is("last_contact_at", null),
    supabase
      .from("traveler_leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .eq("status", "contacted")
      .lt("last_contact_at", threeDaysAgo.toISOString()),
    supabase
      .from("payment_intents")
      .select("product_type,paid_at,created_at")
      .eq("agency_id", agency.id)
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(1),
    supabase
      .from("agency_subscriptions")
      .select("status,expires_at")
      .eq("agency_id", agency.id)
      .in("status", ["trial", "active"])
      .lte("expires_at", nextSevenDays.toISOString())
      .order("expires_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("agency_reviews")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id),
    supabase
      .from("agency_promotions")
      .select("type,ends_at")
      .eq("agency_id", agency.id)
      .eq("status", "active")
      .gte("ends_at", now.toISOString())
      .lte("ends_at", nextSevenDays.toISOString())
      .order("ends_at", { ascending: true })
      .limit(2),
  ])

  const notifications: TopbarNotification[] = []
  if ((newLeads ?? 0) > 0) {
    notifications.push({
      title: "Novo lead recebido",
      description: `${newLeads} lead(s) aguardando atendimento.`,
      href: "/agencia/leads",
    })
  }
  const unansweredCount = (unansweredNew ?? 0) + (staleContacted ?? 0)
  if (unansweredCount > 0) {
    notifications.push({
      title: "Lead sem resposta",
      description: `${unansweredCount} lead(s) precisam de acompanhamento.`,
      href: "/agencia/leads",
    })
  }
  const latestPayment = payments?.[0] as { product_type?: string; paid_at?: string; created_at?: string } | undefined
  if (latestPayment) {
    notifications.push({
      title: "Pagamento aprovado",
      description: `${latestPayment.product_type === "subscription" ? "Assinatura" : "Produto extra"} confirmado em ${formatDate(latestPayment.paid_at ?? latestPayment.created_at)}.`,
      href: "/agencia/assinatura",
    })
  }
  if (subscription?.expires_at) {
    notifications.push({
      title: "Plano próximo do vencimento",
      description: `Vencimento em ${formatDate(subscription.expires_at)}.`,
      href: "/agencia/assinatura",
    })
  }
  if ((reviews ?? 0) > 0) {
    notifications.push({
      title: "Avaliação recebida",
      description: `${reviews} avaliação(ões) registradas para sua agência.`,
      href: "/agencia/perfil",
    })
  }
  for (const promotion of expiringPromotions ?? []) {
    notifications.push({
      title: "Destaque expirando",
      description: `${promotion.type} vence em ${formatDate(promotion.ends_at)}.`,
      href: "/agencia/assinatura",
    })
  }

  return { email: user.email ?? "", notifications: notifications.slice(0, 6) }
}

export async function getMasterTopbarData(): Promise<TopbarData> {
  if (!hasSupabaseEnv()) return { email: "", notifications: [] }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { email: "", notifications: [] }

  const [
    { count: leads },
    { data: payments },
    { count: reviews },
    { data: auditLogs },
    { count: pendingBoosts },
  ] = await Promise.all([
    supabase.from("traveler_leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("payment_intents")
      .select("product_type,amount,paid_at,created_at")
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(1),
    supabase.from("agency_reviews").select("id", { count: "exact", head: true }).eq("hidden", false),
    supabase
      .from("master_audit_logs")
      .select("action,created_at")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("agency_promotions")
      .select("id", { count: "exact", head: true })
      .eq("type", "boost")
      .eq("status", "pending"),
  ])

  const notifications: TopbarNotification[] = []
  if ((leads ?? 0) > 0) {
    notifications.push({
      title: "Novos leads na plataforma",
      description: `${leads} lead(s) novos no funil.`,
      href: "/master/leads",
    })
  }
  const latestPayment = payments?.[0] as { product_type?: string; paid_at?: string; created_at?: string } | undefined
  if (latestPayment) {
    notifications.push({
      title: "Pagamento aprovado",
      description: `${latestPayment.product_type === "subscription" ? "Assinatura" : "Produto extra"} confirmado em ${formatDate(latestPayment.paid_at ?? latestPayment.created_at)}.`,
      href: "/master/financeiro",
    })
  }
  if ((reviews ?? 0) > 0) {
    notifications.push({
      title: "Avaliações para moderação",
      description: `${reviews} avaliação(ões) visíveis na plataforma.`,
      href: "/master/moderacao",
    })
  }
  if ((pendingBoosts ?? 0) > 0) {
    notifications.push({
      title: "Boost aguardando gestão",
      description: `${pendingBoosts} campanha(s) pendente(s).`,
      href: "/master/financeiro",
    })
  }
  const latestAudit = auditLogs?.[0] as { action?: string; created_at?: string } | undefined
  if (latestAudit) {
    notifications.push({
      title: "Atividade master recente",
      description: `${latestAudit.action} em ${formatDate(latestAudit.created_at)}.`,
      href: "/master",
    })
  }

  return { email: user.email ?? "", notifications: notifications.slice(0, 6) }
}
