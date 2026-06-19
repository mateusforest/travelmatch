import { redirect } from "next/navigation"
import { hasSupabaseEnv, createSupabaseServerClient } from "@/lib/supabase/server"
import { formatCurrencyBRL, formatDateBR } from "@/lib/format"
import type { AgencyPackage } from "@/components/agencia/package-card"

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
  desired_destination: string | null
  message: string | null
  status: string
  created_at: string
}

export type AgencyLead = {
  id: string
  name: string
  interest: string
  date: string
  match: number
  status: "Novo" | "Em contato" | "Proposta enviada" | "Convertido" | "Perdido"
}

export type AgencyDashboardData = {
  activePackages: number
  leadsLast30Days: number
  viewsLast30Days: number
  conversionRate: string
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
  converted: "Convertido",
  lost: "Perdido",
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
      viewsLast30Days: 0,
      conversionRate: "0%",
    }
  }

  const supabase = await createSupabaseServerClient()
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [
    { count: activePackages },
    { count: leadsLast30Days },
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

  const viewsLast30Days = (packageViewsLast30Days ?? 0) + (profileViewsLast30Days ?? 0)
  const conversionRate =
    viewsLast30Days > 0 ? `${Math.round(((leadsLast30Days ?? 0) / viewsLast30Days) * 100)}%` : "0%"

  return {
    activePackages: activePackages ?? 0,
    leadsLast30Days: leadsLast30Days ?? 0,
    viewsLast30Days,
    conversionRate,
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
    .select("id,traveler_name,desired_destination,message,status,created_at")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as LeadRow[]).map((lead) => ({
    id: lead.id,
    name: lead.traveler_name ?? "Viajante",
    interest: lead.desired_destination ?? lead.message ?? "Interesse registrado",
    date: formatDateBR(lead.created_at),
    match: 0,
    status: leadStatusMap[lead.status] ?? "Novo",
  }))
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
