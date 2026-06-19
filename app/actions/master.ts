"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"

async function requireMasterClient() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, ok: false, message: "Sessão expirada." }
  }

  const { data, error } = await supabase
    .from("master_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !data) {
    return { supabase, ok: false, message: "Acesso master necessário." }
  }

  return { supabase, ok: true, message: null }
}

export async function setAgencyStatus(agencyId: string, status: "active" | "suspended") {
  const { supabase, ok, message } = await requireMasterClient()

  if (!ok) {
    return { ok: false, message }
  }

  const { error } = await supabase
    .from("agency_profiles")
    .update({ status })
    .eq("id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/master")
  revalidatePath("/master/agencias")
  return { ok: true }
}

export async function setPackageFeatured(packageId: string, featured: boolean) {
  const { supabase, ok, message } = await requireMasterClient()

  if (!ok) {
    return { ok: false, message }
  }

  const { error } = await supabase
    .from("packages")
    .update({ featured })
    .eq("id", packageId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/master")
  revalidatePath("/master/pacotes")
  return { ok: true }
}

export async function setMasterPackageStatus(packageId: string, status: "draft" | "published") {
  const { supabase, ok, message } = await requireMasterClient()

  if (!ok) {
    return { ok: false, message }
  }

  const { error } = await supabase
    .from("packages")
    .update({ status })
    .eq("id", packageId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/master")
  revalidatePath("/master/pacotes")
  return { ok: true }
}

export async function updateAgencyFeatureSettings(
  agencyId: string,
  input: {
    pinned?: boolean
    hidden?: boolean
    manual_order?: number | null
    editorial_label?: string | null
  },
) {
  const { supabase, ok, message } = await requireMasterClient()

  if (!ok) {
    return { ok: false, message }
  }

  const { data: existing } = await supabase
    .from("agency_feature_settings")
    .select("pinned,hidden,manual_order,editorial_label")
    .eq("agency_id", agencyId)
    .maybeSingle()

  const nextPinned = input.pinned ?? existing?.pinned ?? false
  const payload = {
    agency_id: agencyId,
    mode: nextPinned ? "manual" : "auto",
    pinned: nextPinned,
    hidden: input.hidden ?? existing?.hidden ?? false,
    manual_order:
      typeof input.manual_order === "undefined"
        ? existing?.manual_order ?? null
        : input.manual_order,
    editorial_label:
      typeof input.editorial_label === "undefined"
        ? existing?.editorial_label ?? null
        : input.editorial_label?.trim() || null,
  }

  const { error } = await supabase
    .from("agency_feature_settings")
    .upsert(payload, { onConflict: "agency_id" })

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/")
  revalidatePath("/master/agencias")
  return { ok: true }
}
