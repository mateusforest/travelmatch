import { redirect } from "next/navigation"
import { hasSupabaseEnv, createSupabaseServerClient } from "@/lib/supabase/server"

type MasterAgencyRow = {
  id: string
  slug: string | null
  agency_name: string
  city: string | null
  state: string | null
  description: string | null
  status: string
  plan: string
  packages?: { count: number }[]
  traveler_leads?: { count: number }[]
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
    .select("id,slug,agency_name,city,state,description,status,plan,packages(count),traveler_leads(count)")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as MasterAgencyRow[]).map((agency) => ({
    id: agency.id,
    slug: agency.slug,
    name: agency.agency_name,
    city: [agency.city, agency.state].filter(Boolean).join(", ") || "Não informado",
    specialty: agency.description || "Perfil em construção",
    plan: agency.plan === "performance" ? "Performance" : "Essencial",
    status: agency.status,
    packages: agency.packages?.[0]?.count ?? 0,
    leads: agency.traveler_leads?.[0]?.count ?? 0,
    score: 0,
  }))
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
