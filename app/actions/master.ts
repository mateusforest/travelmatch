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

  return { supabase, ok: true, message: null, masterUserId: data.id as string }
}

async function logMasterAction(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: {
    masterUserId?: string | null
    action: string
    entityType: string
    entityId?: string | null
    oldData?: unknown
    newData?: unknown
  },
) {
  await supabase.from("master_audit_logs").insert({
    master_user_id: input.masterUserId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    old_data: input.oldData ?? null,
    new_data: input.newData ?? null,
  })
}

export async function setAgencyStatus(agencyId: string, status: "active" | "suspended") {
  const { supabase, ok, message, masterUserId } = await requireMasterClient()

  if (!ok) {
    return { ok: false, message }
  }

  const { data: oldData } = await supabase
    .from("agency_profiles")
    .select("id,status")
    .eq("id", agencyId)
    .maybeSingle()

  const { error } = await supabase
    .from("agency_profiles")
    .update({ status })
    .eq("id", agencyId)

  if (error) {
    return { ok: false, message: error.message }
  }

  await logMasterAction(supabase, {
    masterUserId,
    action: status === "active" ? "agency_approved" : "agency_suspended",
    entityType: "agency",
    entityId: agencyId,
    oldData,
    newData: { status },
  })

  revalidatePath("/master")
  revalidatePath("/master/agencias")
  return { ok: true }
}

export async function setPackageFeatured(packageId: string, featured: boolean) {
  const { supabase, ok, message, masterUserId } = await requireMasterClient()

  if (!ok) {
    return { ok: false, message }
  }

  const { data: oldData } = await supabase
    .from("packages")
    .select("id,featured")
    .eq("id", packageId)
    .maybeSingle()

  const { error } = await supabase
    .from("packages")
    .update({ featured })
    .eq("id", packageId)

  if (error) {
    return { ok: false, message: error.message }
  }

  await logMasterAction(supabase, {
    masterUserId,
    action: featured ? "package_featured" : "package_unfeatured",
    entityType: "package",
    entityId: packageId,
    oldData,
    newData: { featured },
  })

  revalidatePath("/master")
  revalidatePath("/master/pacotes")
  return { ok: true }
}

export async function setMasterPackageStatus(packageId: string, status: "draft" | "published") {
  const { supabase, ok, message, masterUserId } = await requireMasterClient()

  if (!ok) {
    return { ok: false, message }
  }

  const { data: oldData } = await supabase
    .from("packages")
    .select("id,status")
    .eq("id", packageId)
    .maybeSingle()

  const { error } = await supabase
    .from("packages")
    .update({ status })
    .eq("id", packageId)

  if (error) {
    return { ok: false, message: error.message }
  }

  await logMasterAction(supabase, {
    masterUserId,
    action: status === "published" ? "package_approved" : "package_hidden",
    entityType: "package",
    entityId: packageId,
    oldData,
    newData: { status },
  })

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
    starts_at?: string | null
    ends_at?: string | null
  },
) {
  const { supabase, ok, message, masterUserId } = await requireMasterClient()

  if (!ok) {
    return { ok: false, message }
  }

  const { data: existing } = await supabase
    .from("agency_feature_settings")
    .select("pinned,hidden,manual_order,editorial_label,starts_at,ends_at")
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
    starts_at:
      typeof input.starts_at === "undefined"
        ? existing?.starts_at ?? null
        : input.starts_at || null,
    ends_at:
      typeof input.ends_at === "undefined"
        ? existing?.ends_at ?? null
        : input.ends_at || null,
  }

  const { error } = await supabase
    .from("agency_feature_settings")
    .upsert(payload, { onConflict: "agency_id" })

  if (error) {
    return { ok: false, message: error.message }
  }

  const changedActions = [
    typeof input.pinned !== "undefined"
      ? input.pinned
        ? "agency_feature_pinned"
        : "agency_feature_unpinned"
      : null,
    typeof input.hidden !== "undefined"
      ? input.hidden
        ? "agency_feature_hidden"
        : "agency_feature_shown"
      : null,
    typeof input.manual_order !== "undefined" ? "agency_feature_order_updated" : null,
    typeof input.editorial_label !== "undefined" ? "agency_feature_label_updated" : null,
    typeof input.starts_at !== "undefined" || typeof input.ends_at !== "undefined"
      ? "agency_feature_period_updated"
      : null,
  ].filter(Boolean) as string[]

  await logMasterAction(supabase, {
    masterUserId,
    action: changedActions.join(",") || "agency_feature_settings_updated",
    entityType: "agency",
    entityId: agencyId,
    oldData: existing,
    newData: payload,
  })

  revalidatePath("/")
  revalidatePath("/master/agencias")
  return { ok: true }
}

export async function updateMatchSettings(input: {
  id?: string | null
  destination_weight: number
  category_weight: number
  budget_weight: number
  date_weight: number
  travelers_weight: number
  featured_bonus: number
  performance_bonus: number
}) {
  const { supabase, ok, message, masterUserId } = await requireMasterClient()

  if (!ok) {
    return { ok: false, message }
  }

  const { data: existing } = await supabase
    .from("match_settings")
    .select("*")
    .limit(1)
    .maybeSingle()

  const payload = {
    destination_weight: Number(input.destination_weight) || 0,
    category_weight: Number(input.category_weight) || 0,
    budget_weight: Number(input.budget_weight) || 0,
    date_weight: Number(input.date_weight) || 0,
    travelers_weight: Number(input.travelers_weight) || 0,
    featured_bonus: Number(input.featured_bonus) || 0,
    performance_bonus: Number(input.performance_bonus) || 0,
  }

  const { error } = existing
    ? await supabase.from("match_settings").update(payload).eq("id", existing.id)
    : await supabase.from("match_settings").insert(payload)

  if (error) {
    return { ok: false, message: error.message }
  }

  await logMasterAction(supabase, {
    masterUserId,
    action: "match_settings_updated",
    entityType: "match_settings",
    entityId: existing?.id ?? null,
    oldData: existing,
    newData: payload,
  })

  revalidatePath("/")
  revalidatePath("/master/configuracoes")
  return { ok: true }
}
