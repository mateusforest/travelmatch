"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/format"

export type PackageInput = {
  title: string
  destination: string
  categoryId: string
  description: string
  priceFrom: string
  durationDays: string
  status: "draft" | "published"
  imageUrl?: string
  galleryImages?: string[]
}

function numberFromText(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const packageLimitMessage =
  "Você atingiu o limite de pacotes publicados do seu plano. Faça upgrade para continuar publicando."

async function getPackageLimitState(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  agencyId: string,
  excludingPackageId?: string,
) {
  const { data: subscription } = await supabase
    .from("agency_subscriptions")
    .select("subscription_plans(package_limit)")
    .eq("agency_id", agencyId)
    .in("status", ["trial", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const limit = (subscription?.subscription_plans?.[0]?.package_limit ?? 3) as number | null
  if (limit === null) return { allowed: true, limit, count: 0 }

  let query = supabase
    .from("packages")
    .select("id", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .eq("status", "published")

  if (excludingPackageId) query = query.neq("id", excludingPackageId)

  const { count } = await query
  return { allowed: (count ?? 0) < limit, limit, count: count ?? 0 }
}

export async function createAgencyPackage(input: PackageInput) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const { data: agency, error: agencyError } = await supabase
    .from("agency_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (agencyError || !agency) {
    return { ok: false, message: "Perfil da agência não encontrado." }
  }

  const title = input.title.trim()
  const destination = input.destination.trim()
  const description = input.description.trim()

  if (!title || !destination || !description) {
    return { ok: false, message: "Preencha título, destino e descrição." }
  }

  if (input.status === "published") {
    const limit = await getPackageLimitState(supabase, agency.id)
    if (!limit.allowed) {
      return { ok: false, message: packageLimitMessage }
    }
  }

  const { data: createdPackage, error } = await supabase.from("packages").insert({
    agency_id: agency.id,
    title,
    slug: slugify(`${title}-${Date.now()}`),
    destination,
    category_id: input.categoryId || null,
    description,
    price_from: numberFromText(input.priceFrom),
    duration_days: numberFromText(input.durationDays),
    status: input.status,
    image_url: input.imageUrl?.trim() || null,
  }).select("id").single()

  if (error) {
    return { ok: false, message: error.message }
  }

  const galleryImages = (input.galleryImages ?? []).filter(Boolean).slice(0, 15)
  if (createdPackage?.id && galleryImages.length > 0) {
    await supabase.from("package_gallery_images").insert(
      galleryImages.map((imageUrl, index) => ({
        package_id: createdPackage.id,
        agency_id: agency.id,
        image_url: imageUrl,
        position: index,
      })),
    )
  }

  redirect("/agencia/pacotes")
}

async function getAgencyIdForCurrentUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, agencyId: null, error: "Sessão expirada. Faça login novamente." }
  }

  const { data: agency, error } = await supabase
    .from("agency_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !agency) {
    return { supabase, agencyId: null, error: "Perfil da agência não encontrado." }
  }

  return { supabase, agencyId: agency.id as string, error: null }
}

export async function updateAgencyPackage(packageId: string, input: PackageInput) {
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  const title = input.title.trim()
  const destination = input.destination.trim()
  const description = input.description.trim()

  if (!title || !destination || !description) {
    return { ok: false, message: "Preencha título, destino e descrição." }
  }

  if (input.status === "published") {
    const limit = await getPackageLimitState(supabase, agencyId, packageId)
    if (!limit.allowed) {
      return { ok: false, message: packageLimitMessage }
    }
  }

  const { error } = await supabase
    .from("packages")
    .update({
      title,
      destination,
      category_id: input.categoryId || null,
      description,
      price_from: numberFromText(input.priceFrom),
      duration_days: numberFromText(input.durationDays),
      status: input.status,
      image_url: input.imageUrl?.trim() || null,
    })
    .eq("id", packageId)
    .eq("agency_id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  if (input.galleryImages) {
    const galleryImages = input.galleryImages.filter(Boolean).slice(0, 15)
    await supabase.from("package_gallery_images").delete().eq("package_id", packageId).eq("agency_id", agencyId)
    if (galleryImages.length > 0) {
      await supabase.from("package_gallery_images").insert(
        galleryImages.map((imageUrl, index) => ({
          package_id: packageId,
          agency_id: agencyId,
          image_url: imageUrl,
          position: index,
        })),
      )
    }
  }

  revalidatePath("/agencia/pacotes")
  revalidatePath(`/agencia/pacotes/${packageId}`)
  redirect("/agencia/pacotes")
}

export async function setAgencyPackageStatus(packageId: string, status: "draft" | "published") {
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  if (status === "published") {
    const limit = await getPackageLimitState(supabase, agencyId, packageId)
    if (!limit.allowed) {
      return { ok: false, message: packageLimitMessage }
    }
  }

  const { error } = await supabase
    .from("packages")
    .update({ status })
    .eq("id", packageId)
    .eq("agency_id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/agencia/pacotes")
  revalidatePath(`/agencia/pacotes/${packageId}`)
  return { ok: true }
}

export async function uploadPackageImage(packageId: string, formData: FormData) {
  const file = formData.get("image")
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecione uma imagem." }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const { data: pkg, error: pkgError } = await supabase
    .from("packages")
    .select("id")
    .eq("id", packageId)
    .eq("agency_id", agencyId)
    .maybeSingle()

  if (pkgError || !pkg) {
    return { ok: false, message: "Pacote não encontrado." }
  }

  const ext = file.name.split(".").pop() || "png"
  const path = `package-images/${user.id}/${packageId}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from("travelmatch-images")
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return { ok: false, message: uploadError.message }
  }

  const { data } = supabase.storage.from("travelmatch-images").getPublicUrl(path)
  const { error } = await supabase
    .from("packages")
    .update({ image_url: data.publicUrl })
    .eq("id", packageId)
    .eq("agency_id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  await supabase.from("package_gallery_images").insert({
    package_id: packageId,
    agency_id: agencyId,
    image_url: data.publicUrl,
    storage_path: path,
    position: 0,
  })

  revalidatePath("/agencia/pacotes")
  revalidatePath(`/agencia/pacotes/${packageId}`)
  return { ok: true, url: data.publicUrl }
}

export async function removePackageGalleryImage(packageId: string, imageUrl: string) {
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  const { data: pkg } = await supabase
    .from("packages")
    .select("image_url")
    .eq("id", packageId)
    .eq("agency_id", agencyId)
    .maybeSingle()

  const { data: removed } = await supabase
    .from("package_gallery_images")
    .select("storage_path")
    .eq("package_id", packageId)
    .eq("agency_id", agencyId)
    .eq("image_url", imageUrl)
    .maybeSingle()

  const { error } = await supabase
    .from("package_gallery_images")
    .delete()
    .eq("package_id", packageId)
    .eq("agency_id", agencyId)
    .eq("image_url", imageUrl)

  if (error) {
    return { ok: false, message: error.message }
  }

  if (removed?.storage_path) {
    await supabase.storage.from("travelmatch-images").remove([removed.storage_path])
  }

  if (pkg?.image_url === imageUrl) {
    const { data: nextImage } = await supabase
      .from("package_gallery_images")
      .select("image_url")
      .eq("package_id", packageId)
      .eq("agency_id", agencyId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle()

    await supabase
      .from("packages")
      .update({ image_url: nextImage?.image_url ?? null })
      .eq("id", packageId)
      .eq("agency_id", agencyId)
  }

  revalidatePath(`/agencia/pacotes/${packageId}`)
  revalidatePath(`/agencia/pacotes/${packageId}/editar`)
  return { ok: true }
}

export async function setAgencyPackageCover(packageId: string, imageUrl: string) {
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  const { data: image } = await supabase
    .from("package_gallery_images")
    .select("id")
    .eq("package_id", packageId)
    .eq("agency_id", agencyId)
    .eq("image_url", imageUrl)
    .maybeSingle()

  if (!image) {
    return { ok: false, message: "Imagem não encontrada na galeria." }
  }

  const { error } = await supabase
    .from("packages")
    .update({ image_url: imageUrl })
    .eq("id", packageId)
    .eq("agency_id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/agencia/pacotes")
  revalidatePath(`/agencia/pacotes/${packageId}`)
  revalidatePath(`/agencia/pacotes/${packageId}/editar`)
  return { ok: true }
}

export async function uploadPackageDraftImage(formData: FormData) {
  const file = formData.get("image")
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecione uma imagem." }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Sessão expirada. Faça login novamente." }
  }

  const ext = file.name.split(".").pop() || "png"
  const path = `package-images/${user.id}/draft-${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from("travelmatch-images")
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return { ok: false, message: uploadError.message }
  }

  const { data } = supabase.storage.from("travelmatch-images").getPublicUrl(path)
  return { ok: true, url: data.publicUrl }
}

export async function deleteAgencyPackage(packageId: string) {
  const { supabase, agencyId, error: agencyError } = await getAgencyIdForCurrentUser()

  if (!agencyId) {
    return { ok: false, message: agencyError }
  }

  const { error } = await supabase
    .from("packages")
    .delete()
    .eq("id", packageId)
    .eq("agency_id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/agencia/pacotes")
  return { ok: true }
}
