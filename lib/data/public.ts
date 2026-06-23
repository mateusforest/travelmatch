import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server"
import { formatCurrencyBRL } from "@/lib/format"

export type PublicPackageCard = {
  id: string
  slug: string
  title: string
  destination: string
  price: string
  image_url: string | null
  duration: string
}

export type PublicAgency = {
  id: string
  slug: string
  agency_name: string
  city: string | null
  state: string | null
  description: string | null
  logo_url: string | null
  banner_url: string | null
  phone: string | null
  website: string | null
  instagram: string | null
  average_rating: number
  review_count: number
  recommendation_rate: number
  packages: PublicPackageCard[]
}

export type PublicPackage = {
  id: string
  slug: string
  title: string
  destination: string
  description: string
  price: string
  duration: string
  image_url: string | null
  agency_id: string
  agency_slug: string | null
  agency_name: string
  agency_city: string | null
  agency_state: string | null
  agency_description: string | null
  agency_phone: string | null
  category_slug: string | null
  gallery_images: string[]
}

type PublicAgencyRow = Omit<PublicAgency, "packages"> & {
  packages?: {
    id: string
    slug: string
    title: string
    destination: string
    price_from: number | null
    image_url: string | null
    duration_days: number | null
    status: string
  }[]
}

type PublicPackageRow = {
  id: string
  slug: string
  title: string
  destination: string
  description: string
  price_from: number | null
  duration_days: number | null
  image_url: string | null
  agency_id: string
  agency_profiles: {
    slug: string | null
    agency_name: string
    city: string | null
    state: string | null
    description: string | null
    phone: string | null
  }[] | null
  travel_categories: { slug: string | null }[] | null
  package_gallery_images?: { image_url: string; position: number }[] | null
}

export async function getPublicAgencyBySlug(slug: string): Promise<PublicAgency | null> {
  if (!hasSupabaseEnv()) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("agency_profiles")
    .select("id,slug,agency_name,city,state,description,logo_url,banner_url,phone,website,instagram,packages(id,slug,title,destination,price_from,image_url,duration_days,status)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const agency = data as PublicAgencyRow
  const { data: reputationData } = await supabase.rpc("get_agency_reputation_summary", {
    target_agency_id: agency.id,
  })
  const reputation = Array.isArray(reputationData) ? reputationData[0] : null

  return {
    id: agency.id,
    slug: agency.slug,
    agency_name: agency.agency_name,
    city: agency.city,
    state: agency.state,
    description: agency.description,
    logo_url: agency.logo_url,
    banner_url: agency.banner_url,
    phone: agency.phone,
    website: agency.website,
    instagram: agency.instagram,
    average_rating: Number(reputation?.average_rating ?? 0),
    review_count: Number(reputation?.review_count ?? 0),
    recommendation_rate: Number(reputation?.recommendation_rate ?? 0),
    packages: (agency.packages ?? [])
      .filter((pkg) => pkg.status === "published")
      .map((pkg) => ({
        id: pkg.id,
        slug: pkg.slug,
        title: pkg.title,
        destination: pkg.destination,
        price: formatCurrencyBRL(pkg.price_from),
        image_url: pkg.image_url,
        duration: pkg.duration_days ? `${pkg.duration_days} dias` : "Sob consulta",
      })),
  }
}

export async function getPublicPackageBySlug(slug: string): Promise<PublicPackage | null> {
  if (!hasSupabaseEnv()) {
    return null
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("packages")
    .select("id,slug,title,destination,description,price_from,duration_days,image_url,agency_id,agency_profiles(slug,agency_name,city,state,description,phone),travel_categories(slug),package_gallery_images(image_url,position)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const pkg = data as PublicPackageRow
  const agency = pkg.agency_profiles?.[0]
  const gallery = (pkg.package_gallery_images ?? [])
    .sort((a, b) => a.position - b.position)
    .map((image) => image.image_url)
  const galleryImages = pkg.image_url
    ? [pkg.image_url, ...gallery.filter((image) => image !== pkg.image_url)]
    : gallery

  return {
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    destination: pkg.destination,
    description: pkg.description,
    price: formatCurrencyBRL(pkg.price_from),
    duration: pkg.duration_days ? `${pkg.duration_days} dias` : "Sob consulta",
    image_url: pkg.image_url,
    agency_id: pkg.agency_id,
    agency_slug: agency?.slug ?? null,
    agency_name: agency?.agency_name ?? "Agência",
    agency_city: agency?.city ?? null,
    agency_state: agency?.state ?? null,
    agency_description: agency?.description ?? null,
    agency_phone: agency?.phone ?? null,
    category_slug: pkg.travel_categories?.[0]?.slug ?? null,
    gallery_images: galleryImages.slice(0, 6),
  }
}
