import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server"

export type FeaturedAgency = {
  id: string
  slug: string | null
  name: string
  city: string | null
  state: string | null
  logoUrl: string | null
  publishedPackages: number
  rating: string
  editorialLabel: string | null
  score: number
  pinned: boolean
  manualOrder: number | null
}

type FeaturedAgencyRpcRow = {
  id: string
  slug: string | null
  name: string
  rating: string
  editorial_label: string | null
  score: number
  pinned: boolean
  manual_order: number | null
}

export async function getFeaturedAgencies(limit = 6): Promise<FeaturedAgency[]> {
  if (!hasSupabaseEnv()) {
    return []
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.rpc("get_featured_agencies", {
    limit_count: limit,
  })

  if (error) {
    return []
  }

  const rows = (data ?? []) as FeaturedAgencyRpcRow[]
  const ids = rows.map((agency) => agency.id)
  const { data: profiles } = ids.length > 0
    ? await supabase
      .from("agency_profiles")
      .select("id,city,state,logo_url,packages(status)")
      .in("id", ids)
    : { data: [] }
  const profileById = new Map(
    ((profiles ?? []) as {
      id: string
      city: string | null
      state: string | null
      logo_url: string | null
      packages?: { status: string }[]
    }[]).map((profile) => [profile.id, profile]),
  )

  return rows.filter((agency) => agency.slug).map((agency) => {
    const profile = profileById.get(agency.id)

    return ({
    id: agency.id,
    slug: agency.slug,
    name: agency.name,
    city: profile?.city ?? null,
    state: profile?.state ?? null,
    logoUrl: profile?.logo_url ?? null,
    publishedPackages: profile?.packages?.filter((pkg) => pkg.status === "published").length ?? 0,
    rating: agency.rating,
    editorialLabel: agency.editorial_label,
    score: agency.score,
    pinned: agency.pinned,
    manualOrder: agency.manual_order,
  })
  })
}
