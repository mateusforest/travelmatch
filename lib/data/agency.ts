import { redirect } from "next/navigation"
import { hasSupabaseEnv, createSupabaseServerClient } from "@/lib/supabase/server"
import { formatCurrencyBRL, formatDateBR } from "@/lib/format"
import type { AgencyPackage } from "@/components/agencia/package-card"
import { getPeriodRange } from "@/lib/period"

type AgencyProfile = {
  id: string
  user_id: string
  agency_name: string
  responsible_name: string
  email: string
  phone: string | null
  city: string | null
  state: string | null
  description: string | null
  logo_url: string | null
  website: string | null
  instagram: string | null
  slug: string | null
  status: string
  plan: string
  created_at: string
  updated_at: string
}

type PackageRow = {
  id: string
  agency_id?: string
  title: string
  slug?: string
  destination: string
  category_id?: string | null
  description?: string
  price_from: number | null
  duration_days?: number | null
  status: string
  image_url: string | null
  featured: boolean
  created_at?: string
  updated_at?: string
  travel_categories?: { name: string }[] | null
  traveler_leads?: { count: number }[]
  package_views?: { count: number }[]
}

type LeadRow = {
  id: string
  traveler_name: string | null
  traveler_email: string | null
  traveler_phone: string | null
  desired_destination: string | null
  message: string | null
  status: string
  source: string | null
  source_page: string | null
  cta_label: string | null
  travel_date: string | null
  travelers_count: number | null
  budget_range: string | null
  lead_score: number | null
  priority: string | null
  notes: string | null
  last_contact_at: string | null
  created_at: string
  packages?: { title: string; destination: string }[] | null
}

type LeadTimelineRow = {
  id: string
  event_type: string
  title: string
  description: string | null
  created_at: string
}

export type AgencyLead = {
  id: string
  name: string
  email: string
  phone: string
  interest: string
  message: string
  date: string
  match: number
  status: "Novo" | "Em contato" | "Proposta enviada" | "Ganho" | "Perdido" | "Arquivado"
  statusValue: "new" | "contacted" | "proposal_sent" | "won" | "lost" | "archived"
  source: string
  sourcePage: string
  ctaLabel: string
  travelDate: string
  travelersCount: number | null
  budgetRange: string
  priority: string
  notes: string
  lastContactAt: string
  packageTitle: string
}

export type AgencyLeadDetails = AgencyLead & {
  agencyName: string
  timeline: {
    id: string
    type: string
    title: string
    description: string
    date: string
  }[]
}

export type AgencyAnalyticsData = {
  stats: {
    views: number
    clicks: number
    leads: number
    conversions: number
  }
  ctaEvents: { name: string; value: string }[]
  leadSources: { name: string; value: string }[]
  topClickedPackages: { name: string; value: string }[]
  topLeadPackages: { name: string; value: string }[]
  conversionsByPage: { name: string; value: string }[]
  leadsByStatus: { name: string; value: string }[]
}

export type AgencyDashboardData = {
  activePackages: number
  leadsLast30Days: number
  newLeads: number
  inProgressLeads: number
  proposalsSent: number
  wonLeads: number
  viewsLast30Days: number
  conversionRate: string
  leadSources: { name: string; value: string }[]
  averageRating: number
  reviewCount: number
  recommendationRate: number
}

export type AgencyProfileData = AgencyProfile

export type AgencyPackageDetails = {
  id: string
  title: string
  destination: string
  category_id: string | null
  category_name: string
  description: string
  price_from: number | null
  duration_days: number | null
  image_url: string | null
  status: "draft" | "published" | "archived"
  featured: boolean
  created_at: string
  updated_at: string
}

const leadStatusMap: Record<string, AgencyLead["status"]> = {
  new: "Novo",
  contacted: "Em contato",
  proposal_sent: "Proposta enviada",
  won: "Ganho",
  converted: "Ganho",
  lost: "Perdido",
  archived: "Arquivado",
}

const leadStatusValueMap: Record<string, AgencyLead["statusValue"]> = {
  new: "new",
  contacted: "contacted",
  proposal_sent: "proposal_sent",
  won: "won",
  converted: "won",
  lost: "lost",
  archived: "archived",
}

const packageStatusMap: Record<string, AgencyPackage["status"]> = {
  published: "Publicado",
  draft: "Rascunho",
  archived: "Arquivado",
}

async function getAuthenticatedAgency() {
  if (!hasSupabaseEnv()) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/entrar")
  }

  const { data, error } = await supabase
    .from("agency_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data as AgencyProfile | null
}

export async function getAgencyDashboardData(): Promise<AgencyDashboardData> {
  const agency = await getAuthenticatedAgency()

  if (!agency) {
    return {
      activePackages: 0,
      leadsLast30Days: 0,
      newLeads: 0,
      inProgressLeads: 0,
      proposalsSent: 0,
      wonLeads: 0,
      viewsLast30Days: 0,
      conversionRate: "0%",
      leadSources: [],
      averageRating: 0,
      reviewCount: 0,
      recommendationRate: 0,
    }
  }

  const supabase = await createSupabaseServerClient()
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [
    { count: activePackages },
    { count: leadsLast30Days },
    { count: newLeads },
    { count: contactedLeads },
    { count: proposalsSent },
    { count: wonLeads },
    { count: packageViewsLast30Days },
    { count: profileViewsLast30Days },
  ] = await Promise.all([
    supabase
      .from("packages")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .eq("status", "published"),
    supabase
      .from("traveler_leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .gte("created_at", since.toISOString()),
    supabase
      .from("traveler_leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .eq("status", "new"),
    supabase
      .from("traveler_leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .in("status", ["contacted", "proposal_sent"]),
    supabase
      .from("traveler_leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .eq("status", "proposal_sent"),
    supabase
      .from("traveler_leads")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .in("status", ["won", "converted"]),
    supabase
      .from("package_views")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .gte("created_at", since.toISOString()),
    supabase
      .from("agency_profile_views")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agency.id)
      .gte("created_at", since.toISOString()),
  ])

  const leadsLast30DaysTotal = leadsLast30Days ?? 0
  const viewsLast30Days = (packageViewsLast30Days ?? 0) + (profileViewsLast30Days ?? 0)
  const conversionRate =
    leadsLast30DaysTotal > 0 ? `${Math.round(((wonLeads ?? 0) / leadsLast30DaysTotal) * 100)}%` : "0%"

  const { data: leadSourcesData } = await supabase
    .from("traveler_leads")
    .select("source,source_page")
    .eq("agency_id", agency.id)
    .not("source", "is", null)

  const { data: reputationData } = await supabase.rpc("get_agency_reputation_summary", {
    target_agency_id: agency.id,
  })
  const reputation = Array.isArray(reputationData) ? reputationData[0] : null

  const sourceCounts = new Map<string, number>()
  for (const lead of (leadSourcesData ?? []) as { source: string | null; source_page: string | null }[]) {
    const source = lead.source || lead.source_page || "Nao informado"
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1)
  }

  return {
    activePackages: activePackages ?? 0,
    leadsLast30Days: leadsLast30DaysTotal,
    newLeads: newLeads ?? 0,
    inProgressLeads: contactedLeads ?? 0,
    proposalsSent: proposalsSent ?? 0,
    wonLeads: wonLeads ?? 0,
    viewsLast30Days,
    conversionRate,
    leadSources: Array.from(sourceCounts.entries()).map(([name, value]) => ({
      name,
      value: String(value),
    })),
    averageRating: Number(reputation?.average_rating ?? 0),
    reviewCount: Number(reputation?.review_count ?? 0),
    recommendationRate: Number(reputation?.recommendation_rate ?? 0),
  }
}

export async function getAgencyPackages(): Promise<AgencyPackage[]> {
  const agency = await getAuthenticatedAgency()

  if (!agency) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("packages")
    .select("id,title,destination,price_from,status,image_url,featured,traveler_leads(count),package_views(count)")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as PackageRow[]).map((pkg) => ({
    id: pkg.id,
    title: pkg.title,
    destination: pkg.destination,
    price: formatCurrencyBRL(pkg.price_from),
    match: 0,
    views: pkg.package_views?.[0]?.count ?? 0,
    leads: pkg.traveler_leads?.[0]?.count ?? 0,
    status: packageStatusMap[pkg.status] ?? "Rascunho",
    image: pkg.image_url ?? undefined,
  }))
}

export async function getAgencyPackageDetails(
  packageId: string,
): Promise<AgencyPackageDetails | null> {
  const agency = await getAuthenticatedAgency()

  if (!agency) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("packages")
    .select("id,title,destination,category_id,description,price_from,duration_days,image_url,status,featured,created_at,updated_at,travel_categories(name)")
    .eq("id", packageId)
    .eq("agency_id", agency.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  const pkg = data as PackageRow

  return {
    id: pkg.id,
    title: pkg.title,
    destination: pkg.destination,
    category_id: pkg.category_id ?? null,
    category_name: pkg.travel_categories?.[0]?.name ?? "Sem categoria",
    description: pkg.description ?? "",
    price_from: pkg.price_from,
    duration_days: pkg.duration_days ?? null,
    image_url: pkg.image_url,
    status: pkg.status as AgencyPackageDetails["status"],
    featured: pkg.featured,
    created_at: pkg.created_at ?? "",
    updated_at: pkg.updated_at ?? "",
  }
}

export async function getAgencyProfile(): Promise<AgencyProfileData | null> {
  return getAuthenticatedAgency()
}

export async function getAgencyLeads(): Promise<AgencyLead[]> {
  const agency = await getAuthenticatedAgency()

  if (!agency) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("traveler_leads")
    .select("id,traveler_name,traveler_email,traveler_phone,desired_destination,message,status,source,source_page,cta_label,travel_date,travelers_count,budget_range,lead_score,priority,notes,last_contact_at,created_at,packages(title,destination)")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as LeadRow[]).map(mapLeadRow)
}

export async function getAgencyLeadDetails(leadId: string): Promise<AgencyLeadDetails | null> {
  const agency = await getAuthenticatedAgency()

  if (!agency) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const [{ data: lead, error }, { data: timeline, error: timelineError }] = await Promise.all([
    supabase
      .from("traveler_leads")
      .select("id,traveler_name,traveler_email,traveler_phone,desired_destination,message,status,source,source_page,cta_label,travel_date,travelers_count,budget_range,lead_score,priority,notes,last_contact_at,created_at,packages(title,destination)")
      .eq("id", leadId)
      .eq("agency_id", agency.id)
      .maybeSingle(),
    supabase
      .from("lead_timeline_events")
      .select("id,event_type,title,description,created_at")
      .eq("lead_id", leadId)
      .eq("agency_id", agency.id)
      .order("created_at", { ascending: false }),
  ])

  if (error || timelineError) {
    throw new Error(error?.message ?? timelineError?.message ?? "Erro ao carregar lead.")
  }

  if (!lead) {
    return null
  }

  return {
    ...mapLeadRow(lead as LeadRow),
    agencyName: agency.agency_name,
    timeline: ((timeline ?? []) as LeadTimelineRow[]).map((event) => ({
      id: event.id,
      type: event.event_type,
      title: event.title,
      description: event.description ?? "",
      date: formatDateBR(event.created_at),
    })),
  }
}

export async function getAgencyAnalyticsData(period?: string | null, from?: string | null, to?: string | null): Promise<AgencyAnalyticsData> {
  const agency = await getAuthenticatedAgency()

  if (!agency) {
    return {
      stats: { views: 0, clicks: 0, leads: 0, conversions: 0 },
      ctaEvents: [],
      leadSources: [],
      topClickedPackages: [],
      topLeadPackages: [],
      conversionsByPage: [],
      leadsByStatus: [],
    }
  }

  const supabase = await createSupabaseServerClient()
  const range = getPeriodRange(period, from, to)
  const [
    { count: packageViews },
    { count: profileViews },
    { data: ctaEvents },
    { data: leads },
    { data: packages },
  ] = await Promise.all([
    supabase.from("package_views").select("id", { count: "exact", head: true }).eq("agency_id", agency.id).gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("agency_profile_views").select("id", { count: "exact", head: true }).eq("agency_id", agency.id).gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("cta_events").select("event_type,source_page,package_id").eq("agency_id", agency.id).gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("traveler_leads").select("status,source,source_page,package_id").eq("agency_id", agency.id).gte("created_at", range.from).lte("created_at", range.to),
    supabase.from("packages").select("id,title,traveler_leads(count),package_views(count)").eq("agency_id", agency.id),
  ])

  const leadRows = (leads ?? []) as { status: string; source: string | null; source_page: string | null; package_id: string | null }[]
  const eventRows = (ctaEvents ?? []) as { event_type: string; source_page: string | null; package_id: string | null }[]
  const packageRows = (packages ?? []) as { id: string; title: string; traveler_leads?: { count: number }[]; package_views?: { count: number }[] }[]
  const countBy = (items: string[]) => {
    const map = new Map<string, number>()
    for (const item of items) map.set(item, (map.get(item) ?? 0) + 1)
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value: String(value) }))
  }

  return {
    stats: {
      views: (packageViews ?? 0) + (profileViews ?? 0),
      clicks: eventRows.length,
      leads: leadRows.length,
      conversions: leadRows.filter((lead) => lead.status === "won" || lead.status === "converted").length,
    },
    ctaEvents: countBy(eventRows.map((event) => event.event_type)),
    leadSources: countBy(leadRows.map((lead) => lead.source ?? "Nao informado")),
    topClickedPackages: packageRows
      .map((pkg) => ({ name: pkg.title, value: String(pkg.package_views?.[0]?.count ?? 0) }))
      .filter((item) => item.value !== "0")
      .slice(0, 6),
    topLeadPackages: packageRows
      .map((pkg) => ({ name: pkg.title, value: String(pkg.traveler_leads?.[0]?.count ?? 0) }))
      .filter((item) => item.value !== "0")
      .slice(0, 6),
    conversionsByPage: countBy(leadRows.filter((lead) => lead.status === "won" || lead.status === "converted").map((lead) => lead.source_page ?? "Nao informado")),
    leadsByStatus: countBy(leadRows.map((lead) => leadStatusMap[lead.status] ?? lead.status)),
  }
}

function mapLeadRow(lead: LeadRow): AgencyLead {
  return {
    id: lead.id,
    name: lead.traveler_name ?? "Viajante",
    email: lead.traveler_email ?? "Nao informado",
    phone: lead.traveler_phone ?? "Nao informado",
    interest: lead.desired_destination ?? lead.message ?? "Interesse registrado",
    message: lead.message ?? "Sem mensagem",
    date: formatDateBR(lead.created_at),
    match: lead.lead_score ?? 0,
    status: leadStatusMap[lead.status] ?? "Novo",
    statusValue: leadStatusValueMap[lead.status] ?? "new",
    source: lead.source ?? "Nao informado",
    sourcePage: lead.source_page ?? "Nao informado",
    ctaLabel: lead.cta_label ?? "Nao informado",
    travelDate: lead.travel_date ?? "Nao informado",
    travelersCount: lead.travelers_count,
    budgetRange: lead.budget_range ?? "Nao informado",
    priority: lead.priority ?? "normal",
    notes: lead.notes ?? "",
    lastContactAt: lead.last_contact_at ? formatDateBR(lead.last_contact_at) : "Nao informado",
    packageTitle: lead.packages?.[0]?.title ?? "Sem pacote vinculado",
  }
}

export async function getActiveCategories() {
  if (!hasSupabaseEnv()) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("travel_categories")
    .select("id,name,slug")
    .eq("active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}
