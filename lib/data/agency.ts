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
  status: string
  plan: string
  created_at: string
  updated_at: string
}

type PackageRow = {
  id: string
  title: string
  destination: string
  price_from: number | null
  status: string
  image_url: string | null
  featured: boolean
  traveler_leads?: { count: number }[]
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
      conversionRate: "—",
    }
  }

  const supabase = await createSupabaseServerClient()
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [{ count: activePackages }, { count: leadsLast30Days }] = await Promise.all([
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
  ])

  return {
    activePackages: activePackages ?? 0,
    leadsLast30Days: leadsLast30Days ?? 0,
    viewsLast30Days: 0,
    conversionRate: "—",
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
    .select("id,title,destination,price_from,status,image_url,featured,traveler_leads(count)")
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
    views: 0,
    leads: pkg.traveler_leads?.[0]?.count ?? 0,
    status: packageStatusMap[pkg.status] ?? "Rascunho",
    image: pkg.image_url ?? undefined,
  }))
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
