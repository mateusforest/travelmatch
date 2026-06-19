import { NextResponse } from "next/server"
import {
  getMercadoPagoPayment,
  isMercadoPagoWebhookAllowed,
} from "@/lib/mercado-pago"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

type PaymentIntentRow = {
  id: string
  agency_id: string | null
  product_type: "subscription" | "promotion"
  reference_id: string | null
  status: string
  amount: number
  external_reference: string | null
  provider_payload: {
    planSlug?: string
    promotionType?: "featured_7" | "featured_15" | "featured_30" | "boost"
    days?: number | null
    [key: string]: unknown
  } | null
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

async function getWebhookPaymentId(request: Request) {
  const url = new URL(request.url)
  const bodyText = await request.text()
  const body = bodyText ? JSON.parse(bodyText) as Record<string, unknown> : {}
  const data = body.data as { id?: string | number } | undefined

  return String(
    data?.id ??
      body.id ??
      url.searchParams.get("data.id") ??
      url.searchParams.get("id") ??
      "",
  )
}

async function createAuditLog(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  input: {
    action: string
    entityType: string
    entityId?: string | null
    newData?: unknown
  },
) {
  await supabase.from("master_audit_logs").insert({
    master_user_id: null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    old_data: null,
    new_data: input.newData ?? null,
  })
}

async function activateSubscription(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  intent: PaymentIntentRow,
  providerPaymentId: string,
) {
  if (!intent.agency_id || !intent.reference_id) return

  const now = new Date()
  await supabase
    .from("agency_subscriptions")
    .update({ status: "canceled", canceled_at: now.toISOString() })
    .eq("agency_id", intent.agency_id)
    .in("status", ["trial", "active"])

  const { data } = await supabase
    .from("agency_subscriptions")
    .insert({
      agency_id: intent.agency_id,
      plan_id: intent.reference_id,
      status: "active",
      started_at: now.toISOString(),
      expires_at: addDays(now, 30).toISOString(),
      gateway_subscription_id: null,
    })
    .select("id")
    .single()

  await createAuditLog(supabase, {
    action: "payment_subscription_activated",
    entityType: "subscription",
    entityId: data?.id ?? null,
    newData: {
      paymentIntentId: intent.id,
      providerPaymentId,
      agencyId: intent.agency_id,
      planId: intent.reference_id,
    },
  })
}

async function activatePromotion(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  intent: PaymentIntentRow,
  providerPaymentId: string,
) {
  if (!intent.agency_id) return

  const type = intent.provider_payload?.promotionType
  if (!type) return

  const now = new Date()
  const days = typeof intent.provider_payload?.days === "number" ? intent.provider_payload.days : null
  const isBoost = type === "boost"
  const { data } = await supabase
    .from("agency_promotions")
    .insert({
      agency_id: intent.agency_id,
      type,
      starts_at: now.toISOString(),
      ends_at: days ? addDays(now, days).toISOString() : null,
      status: isBoost ? "pending" : "active",
      amount: intent.amount,
      campaign_status: isBoost ? "pending" : null,
    })
    .select("id")
    .single()

  if (data?.id) {
    await supabase
      .from("payment_intents")
      .update({ reference_id: data.id })
      .eq("id", intent.id)
  }

  await createAuditLog(supabase, {
    action: "payment_promotion_activated",
    entityType: "promotion",
    entityId: data?.id ?? null,
    newData: {
      paymentIntentId: intent.id,
      providerPaymentId,
      agencyId: intent.agency_id,
      promotionType: type,
    },
  })
}

export async function POST(request: Request) {
  if (!isMercadoPagoWebhookAllowed(request)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const paymentId = await getWebhookPaymentId(request)
  if (!paymentId) {
    return NextResponse.json({ ok: true, ignored: "missing_payment_id" })
  }

  const payment = await getMercadoPagoPayment(paymentId)
  const externalReference = payment.external_reference
  if (!externalReference) {
    return NextResponse.json({ ok: true, ignored: "missing_external_reference" })
  }

  const supabase = createSupabaseAdminClient()

  const { data: intent } = await supabase
    .from("payment_intents")
    .select("id,agency_id,product_type,reference_id,status,amount,external_reference,provider_payload")
    .eq("external_reference", externalReference)
    .maybeSingle()

  if (!intent) {
    return NextResponse.json({ ok: true, ignored: "intent_not_found" })
  }

  const intentRow = intent as PaymentIntentRow
  const status = payment.status ?? "unknown"
  const isApproved = status === "approved"
  const isRejected = ["rejected", "cancelled", "canceled", "refunded", "charged_back"].includes(status)
  const nextStatus = isApproved ? "paid" : isRejected ? "failed" : "pending"

  await supabase
    .from("payment_intents")
    .update({
      status: nextStatus,
      provider_payment_id: String(payment.id ?? paymentId),
      paid_at: isApproved ? new Date().toISOString() : null,
      failure_reason: isRejected ? payment.status_detail ?? status : null,
      provider_payload: {
        ...(intentRow.provider_payload ?? {}),
        payment,
      },
    })
    .eq("id", intentRow.id)

  if (isApproved && intentRow.status !== "paid") {
    if (intentRow.product_type === "subscription") {
      await activateSubscription(supabase, intentRow, String(payment.id ?? paymentId))
    }

    if (intentRow.product_type === "promotion") {
      await activatePromotion(supabase, intentRow, String(payment.id ?? paymentId))
    }
  }

  return NextResponse.json({ ok: true })
}
