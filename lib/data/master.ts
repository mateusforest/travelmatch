import { redirect } from "next/navigation"
import { hasSupabaseEnv, createSupabaseServerClient } from "@/lib/supabase/server"

type MasterAgencyRow = {
  id: string
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
  title: string
  destination: string
  status: string
  featured: boolean
  agency_profiles: { agency_name: string }[] | null
  travel_categories: { name: string }[] | null
  traveler_leads?: { count: number }[]
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
  title: string
  agency: string
  category: string
  destination: string
  views: number
  leads: number
  status: string
  featured: boolean
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
    .select("id,agency_name,city,state,description,status,plan,packages(count),traveler_leads(count)")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as MasterAgencyRow[]).map((agency) => ({
    id: agency.id,
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
    .select("id,title,destination,status,featured,agency_profiles(agency_name),travel_categories(name),traveler_leads(count)")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as MasterPackageRow[]).map((pkg) => ({
    id: pkg.id,
    title: pkg.title,
    agency: pkg.agency_profiles?.[0]?.agency_name ?? "Agência",
    category: pkg.travel_categories?.[0]?.name ?? "Sem categoria",
    destination: pkg.destination,
    views: 0,
    leads: pkg.traveler_leads?.[0]?.count ?? 0,
    status: pkg.featured ? "Destaque" : pkg.status === "published" ? "Ativo" : "Pendente",
    featured: pkg.featured,
  }))
}
