import { redirect } from "next/navigation"
import { hasSupabaseEnv, createSupabaseServerClient } from "@/lib/supabase/server"
import { calculateAgencyFeatureScoreBreakdown } from "@/lib/data/agency-feature-score"
import { getPeriodRange } from "@/lib/period"

type MasterAgencyRow = {
  id: string
  slug: string | null
  agency_name: string
  city: string | null
  state: string | null
  description: string | null
  status: string
  plan: string
  packages?: {
    status?: string
    package_views?: { count: number }[]
  }[]
  traveler_leads?: { status: string }[]
  agency_profile_views?: { count: number }[]
  cta_events?: { count: number }[]
  agency_feature_settings?: {
    pinned: boolean
    hidden: boolean
    manual_order: number | null
    editorial_label: string | null
    starts_at: string | null
    ends_at: string | null
  }[] | null
}

type MasterPackageRow = {
  id: string
  slug: string
  title: string
  destination: string
  status: string
  featured: boolean
  agency_profiles: { agency_name: string }[] | null
  travel_categories: { name: string }[] | null
  traveler_leads?: { count: number }[]
  package_views?: { count: number }[]
}

type MasterLeadRow = {
  id: string
  status: string
  agency_profiles: { agency_name: string }[] | null
  packages: { title: string }[] | null
}

type MasterAuditLogRow = {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  created_at: string
}

export type MasterOverviewData = {
  agenciesTotal: number
  activeAgencies: number
  activePackages: number
  leadsTotal: number
  newAgencies: number
  newPackages: number
  newLeads: number
}

export type MasterAgency = {
  id: string
  slug: string | null
  name: string
  city: string
  specialty: string
  plan: string
  status: string
  packages: number
  leads: number
  score: number
  featurePinned: boolean
  featureHidden: boolean
  featureManualOrder: number | null
  featureEditorialLabel: string
  featureStartsAt: string
  featureEndsAt: string
  scoreBreakdown: {
    label: string
    value: number
  }[]
}

export type MasterPackage = {
  id: string
  slug: string
  title: string
  agency: string
  category: string
  destination: string
  views: number
  leads: number
  status: string
  featured: boolean
}

export type MasterLeadFunnelData = {
  totalLeads: number
  wonLeads: number
  conversionRate: string
  ctaEventsTotal: number
  leadsByStatus: { name: string; value: string }[]
  leadsByAgency: { name: string; value: string }[]
  leadsByPackage: { name: string; value: string }[]
}

export type MasterAuditLog = {
  id: string
  action: string
  entityType: string
  entityId: string
  createdAt: string
}

export type MasterReviewModerationItem = {
  id: string
  agency: string
  leadId: string
  rating: number
  comment: string
  wouldRecommend: boolean
  hidden: boolean
  createdAt: string
}

export type UnansweredLeadAlert = {
  id: string
  agency: string
  status: string
  createdAt: string
}

export type MasterCommercialAnalyticsData = {
  indicators: {
    visitors: number
    sessions: number
    clicks: number
    leads: number
    conversionRate: string
  }
  eventsByType: { name: string; value: string }[]
  leadsBySource: { name: string; value: string }[]
  topClickedPackages: { name: string; value: string }[]
  topLeadPackages: { name: string; value: string }[]
  agenciesByConversion: { name: string; value: string }[]
  pagesByConversion: { name: string; value: string }[]
  reputationRanking: { name: string; value: string }[]
  worstReputation: { name: string; value: string }[]
  platformAverageRating: string
}

async function requireMaster() {
  if (!hasSupabaseEnv()) {
    return false
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/entrar")
  }

  const { data, error } = await supabase
    .from("master_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    redirect("/agencia")
  }

  return true
}

export async function getMasterOverviewData(): Promise<MasterOverviewData> {
  const isMaster = await requireMaster()

  if (!isMaster) {
    return {
      agenciesTotal: 0,
      activeAgencies: 0,
      activePackages: 0,
      leadsTotal: 0,
      newAgencies: 0,
      newPackages: 0,
      newLeads: 0,
    }
  }

  const supabase = await createSupabaseServerClient()
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [
    { count: agenciesTotal },
    { count: activeAgencies },
    { count: activePackages },
    { count: leadsTotal },
    { count: newAgencies },
    { count: newPackages },
    { count: newLeads },
  ] = await Promise.all([
    supabase.from("agency_profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("agency_profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("packages")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("traveler_leads").select("id", { count: "exact", head: true }),
    supabase
      .from("agency_profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since.toISOString()),
    supabase
      .from("packages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since.toISOString()),
    supabase
      .from("traveler_leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since.toISOString()),
  ])

  return {
    agenciesTotal: agenciesTotal ?? 0,
    activeAgencies: activeAgencies ?? 0,
    activePackages: activePackages ?? 0,
    leadsTotal: leadsTotal ?? 0,
    newAgencies: newAgencies ?? 0,
    newPackages: newPackages ?? 0,
    newLeads: newLeads ?? 0,
  }
}

export async function getMasterAgencies(): Promise<MasterAgency[]> {
  const isMaster = await requireMaster()

  if (!isMaster) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("agency_profiles")
    .select("id,slug,agency_name,city,state,description,status,plan,packages(status,package_views(count)),traveler_leads(status),agency_profile_views(count),cta_events(count),agency_feature_settings(pinned,hidden,manual_order,editorial_label,starts_at,ends_at)")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as MasterAgencyRow[]).map((agency) => {
    const publishedPackages = (agency.packages ?? []).filter((pkg) => pkg.status === "published")
    const packageViews = publishedPackages.reduce(
      (total, pkg) => total + (pkg.package_views?.[0]?.count ?? 0),
      0,
    )
    const leads = agency.traveler_leads ?? []
    const wonLeads = leads.filter((lead) => lead.status === "won" || lead.status === "converted").length
    const settings = agency.agency_feature_settings?.[0]
    const scoreBreakdown = calculateAgencyFeatureScoreBreakdown({
      status: agency.status,
      city: agency.city,
      state: agency.state,
      description: agency.description,
      publishedPackages: publishedPackages.length,
      profileViews: agency.agency_profile_views?.[0]?.count ?? 0,
      packageViews,
      leads: leads.length,
      wonLeads,
      ctaEvents: agency.cta_events?.[0]?.count ?? 0,
    })

    return {
    id: agency.id,
    slug: agency.slug,
    name: agency.agency_name,
    city: [agency.city, agency.state].filter(Boolean).join(", ") || "Não informado",
    specialty: agency.description || "Perfil em construção",
    plan: agency.plan === "performance" ? "Performance" : "Essencial",
    status: agency.status,
    packages: publishedPackages.length,
    leads: leads.length,
    score: scoreBreakdown.totalScore,
    featurePinned: settings?.pinned ?? false,
    featureHidden: settings?.hidden ?? false,
    featureManualOrder: settings?.manual_order ?? null,
    featureEditorialLabel: settings?.editorial_label ?? "",
    featureStartsAt: settings?.starts_at ?? "",
    featureEndsAt: settings?.ends_at ?? "",
    scoreBreakdown: [
      { label: "Perfil", value: scoreBreakdown.completenessScore },
      { label: "Views perfil", value: scoreBreakdown.profileViewsScore },
      { label: "Views pacotes", value: scoreBreakdown.packageViewsScore },
      { label: "Leads", value: scoreBreakdown.leadsScore },
      { label: "Conversao", value: scoreBreakdown.conversionScore },
      { label: "CTA", value: scoreBreakdown.ctaEventsScore },
      { label: "Pacotes", value: scoreBreakdown.publishedPackagesScore },
    ],
    }
  })
}

export async function getMasterPackages(): Promise<MasterPackage[]> {
  const isMaster = await requireMaster()

  if (!isMaster) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("packages")
    .select("id,slug,title,destination,status,featured,agency_profiles(agency_name),travel_categories(name),traveler_leads(count),package_views(count)")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as MasterPackageRow[]).map((pkg) => ({
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    agency: pkg.agency_profiles?.[0]?.agency_name ?? "Agência",
    category: pkg.travel_categories?.[0]?.name ?? "Sem categoria",
    destination: pkg.destination,
    views: pkg.package_views?.[0]?.count ?? 0,
    leads: pkg.traveler_leads?.[0]?.count ?? 0,
    status: pkg.featured ? "Destaque" : pkg.status === "published" ? "Ativo" : "Pendente",
    featured: pkg.featured,
  }))
}

export async function getMasterLeadFunnelData(): Promise<MasterLeadFunnelData> {
  const isMaster = await requireMaster()

  if (!isMaster) {
    return {
      totalLeads: 0,
      wonLeads: 0,
      conversionRate: "0%",
      ctaEventsTotal: 0,
      leadsByStatus: [],
      leadsByAgency: [],
      leadsByPackage: [],
    }
  }

  const supabase = await createSupabaseServerClient()
  const [{ data: leads, error: leadsError }, { count: ctaEventsTotal }] = await Promise.all([
    supabase
      .from("traveler_leads")
      .select("id,status,agency_profiles(agency_name),packages(title)")
      .order("created_at", { ascending: false }),
    supabase.from("cta_events").select("id", { count: "exact", head: true }),
  ])

  if (leadsError) {
    throw new Error(leadsError.message)
  }

  const rows = (leads ?? []) as MasterLeadRow[]
  const totalLeads = rows.length
  const wonLeads = rows.filter((lead) => lead.status === "won" || lead.status === "converted").length

  const statusLabels: Record<string, string> = {
    new: "Novos",
    contacted: "Em atendimento",
    proposal_sent: "Propostas",
    won: "Ganhos",
    converted: "Ganhos",
    lost: "Perdidos",
    archived: "Arquivados",
  }

  const countBy = (items: string[]) => {
    const counts = new Map<string, number>()
    for (const item of items) {
      counts.set(item, (counts.get(item) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value: String(value) }))
  }

  return {
    totalLeads,
    wonLeads,
    conversionRate: totalLeads > 0 ? `${Math.round((wonLeads / totalLeads) * 100)}%` : "0%",
    ctaEventsTotal: ctaEventsTotal ?? 0,
    leadsByStatus: countBy(rows.map((lead) => statusLabels[lead.status] ?? lead.status)),
    leadsByAgency: countBy(rows.map((lead) => lead.agency_profiles?.[0]?.agency_name ?? "Sem agencia")),
    leadsByPackage: countBy(rows.map((lead) => lead.packages?.[0]?.title ?? "Sem pacote")),
  }
}

export async function getMasterAuditLogs(limit = 8): Promise<MasterAuditLog[]> {
  const isMaster = await requireMaster()

  if (!isMaster) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("master_audit_logs")
    .select("id,action,entity_type,entity_id,created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return []
  }

  return ((data ?? []) as MasterAuditLogRow[]).map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id ?? "sem entidade",
    createdAt: new Date(log.created_at).toLocaleDateString("pt-BR"),
  }))
}

export async function getMasterCommercialAnalyticsData(period?: string | null, from?: string | null, to?: string | null): Promise<MasterCommercialAnalyticsData> {
  const isMaster = await requireMaster()

  if (!isMaster) {
    return {
      indicators: { visitors: 0, sessions: 0, clicks: 0, leads: 0, conversionRate: "0%" },
      eventsByType: [],
      leadsBySource: [],
      topClickedPackages: [],
      topLeadPackages: [],
      agenciesByConversion: [],
      pagesByConversion: [],
      reputationRanking: [],
      worstReputation: [],
      platformAverageRating: "0.0",
    }
  }

  const supabase = await createSupabaseServerClient()
  const range = getPeriodRange(period, from, to)
  const [
    { count: packageViews },
    { count: profileViews },
    { data: events },
    { data: leads },
    { data: packages },
    { data: agencies },
    { data: reviews },
  ] = await Promise.all([
    supabase.from("package_views").select("id", { count: "exact", head: true }).gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("agency_profile_views").select("id", { count: "exact", head: true }).gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("cta_events").select("event_type,source_page,package_id").gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("traveler_leads").select("status,source,source_page,agency_id,package_id").gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("packages").select("id,title,package_views(count),traveler_leads(count)"),
    supabase.from("agency_profiles").select("id,agency_name,traveler_leads(status)"),
    supabase.from("agency_reviews").select("rating,agency_id,agency_profiles(agency_name)").gte("created_at", range.from).lte("created_at", range.to),
  ])

  const eventRows = (events ?? []) as { event_type: string; source_page: string | null; package_id: string | null }[]
  const leadRows = (leads ?? []) as { status: string; source: string | null; source_page: string | null; agency_id: string | null; package_id: string | null }[]
  const packageRows = (packages ?? []) as { id: string; title: string; package_views?: { count: number }[]; traveler_leads?: { count: number }[] }[]
  const agencyRows = (agencies ?? []) as { id: string; agency_name: string; traveler_leads?: { status: string }[] }[]
  const reviewRows = (reviews ?? []) as { rating: number; agency_id: string; agency_profiles?: { agency_name: string }[] | null }[]
  const wonLeads = leadRows.filter((lead) => lead.status === "won" || lead.status === "converted").length
  const countBy = (items: string[]) => {
    const map = new Map<string, number>()
    for (const item of items) map.set(item, (map.get(item) ?? 0) + 1)
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value: String(value) }))
  }

  return {
    indicators: {
      visitors: (packageViews ?? 0) + (profileViews ?? 0),
      sessions: (packageViews ?? 0) + (profileViews ?? 0),
      clicks: eventRows.length,
      leads: leadRows.length,
      conversionRate: leadRows.length > 0 ? `${Math.round((wonLeads / leadRows.length) * 100)}%` : "0%",
    },
    eventsByType: countBy(eventRows.map((event) => event.event_type)),
    leadsBySource: countBy(leadRows.map((lead) => lead.source ?? "Nao informado")),
    topClickedPackages: packageRows
      .map((pkg) => ({ name: pkg.title, value: String(pkg.package_views?.[0]?.count ?? 0) }))
      .filter((item) => item.value !== "0")
      .slice(0, 6),
    topLeadPackages: packageRows
      .map((pkg) => ({ name: pkg.title, value: String(pkg.traveler_leads?.[0]?.count ?? 0) }))
      .filter((item) => item.value !== "0")
      .slice(0, 6),
    agenciesByConversion: agencyRows
      .map((agency) => {
        const agencyLeads = agency.traveler_leads ?? []
        const agencyWon = agencyLeads.filter((lead) => lead.status === "won" || lead.status === "converted").length
        const rate = agencyLeads.length > 0 ? Math.round((agencyWon / agencyLeads.length) * 100) : 0
        return { name: agency.agency_name, value: `${rate}%` }
      })
      .filter((item) => item.value !== "0%")
      .slice(0, 6),
    pagesByConversion: countBy(
      leadRows
        .filter((lead) => lead.status === "won" || lead.status === "converted")
        .map((lead) => lead.source_page ?? "Nao informado"),
    ),
    reputationRanking: Array.from(
      reviewRows.reduce((map, review) => {
        const name = review.agency_profiles?.[0]?.agency_name ?? "Agencia"
        const current = map.get(name) ?? { total: 0, count: 0 }
        map.set(name, { total: current.total + review.rating, count: current.count + 1 })
        return map
      }, new Map<string, { total: number; count: number }>()),
    )
      .map(([name, value]) => ({ name, value: (value.total / value.count).toFixed(1) }))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 6),
    worstReputation: Array.from(
      reviewRows.reduce((map, review) => {
        const name = review.agency_profiles?.[0]?.agency_name ?? "Agencia"
        const current = map.get(name) ?? { total: 0, count: 0 }
        map.set(name, { total: current.total + review.rating, count: current.count + 1 })
        return map
      }, new Map<string, { total: number; count: number }>()),
    )
      .map(([name, value]) => ({ name, value: (value.total / value.count).toFixed(1) }))
      .sort((a, b) => Number(a.value) - Number(b.value))
      .slice(0, 6),
    platformAverageRating:
      reviewRows.length > 0
        ? (reviewRows.reduce((total, review) => total + review.rating, 0) / reviewRows.length).toFixed(1)
        : "0.0",
  }
}

export async function getMasterReviewModerationItems(): Promise<MasterReviewModerationItem[]> {
  const isMaster = await requireMaster()
  if (!isMaster) return []

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("agency_reviews")
    .select("id,lead_id,rating,comment,would_recommend,hidden,created_at,agency_profiles(agency_name)")
    .order("created_at", { ascending: false })
    .limit(30)

  if (error) return []

  return ((data ?? []) as {
    id: string
    lead_id: string
    rating: number
    comment: string | null
    would_recommend: boolean
    hidden: boolean
    created_at: string
    agency_profiles?: { agency_name: string }[] | null
  }[]).map((review) => ({
    id: review.id,
    agency: review.agency_profiles?.[0]?.agency_name ?? "Agencia",
    leadId: review.lead_id,
    rating: review.rating,
    comment: review.comment ?? "Sem comentario",
    wouldRecommend: review.would_recommend,
    hidden: review.hidden,
    createdAt: new Date(review.created_at).toLocaleDateString("pt-BR"),
  }))
}

export async function getMasterUnansweredLeadAlerts(): Promise<UnansweredLeadAlert[]> {
  const isMaster = await requireMaster()
  if (!isMaster) return []

  const supabase = await createSupabaseServerClient()
  const now = Date.now()
  const { data, error } = await supabase
    .from("traveler_leads")
    .select("id,status,created_at,last_contact_at,agency_profiles(agency_name)")
    .in("status", ["new", "contacted"])
    .order("created_at", { ascending: true })
    .limit(50)

  if (error) return []

  return ((data ?? []) as {
    id: string
    status: string
    created_at: string
    last_contact_at: string | null
    agency_profiles?: { agency_name: string }[] | null
  }[])
    .filter((lead) => {
      const reference = lead.last_contact_at ?? lead.created_at
      const hours = (now - new Date(reference).getTime()) / 36e5
      return lead.status === "new" ? hours > 24 : hours > 72
    })
    .map((lead) => ({
      id: lead.id,
      agency: lead.agency_profiles?.[0]?.agency_name ?? "Agencia",
      status: lead.status,
      createdAt: new Date(lead.created_at).toLocaleDateString("pt-BR"),
    }))
}
