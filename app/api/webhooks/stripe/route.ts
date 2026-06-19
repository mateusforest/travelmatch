import { NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { type StripeEvent, verifyStripeWebhookPayload } from "@/lib/stripe"

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

function getSessionString(session: Record<string, unknown>, key: string) {
  const value = session[key]
  return typeof value === "string" ? value : null
}

function getSessionMetadata(session: Record<string, unknown>) {
  const metadata = session.metadata
  return metadata && typeof metadata === "object" ? metadata as Record<string, string> : {}
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
  gatewayPaymentId: string | null,
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
    action: "stripe_subscription_activated",
    entityType: "subscription",
    entityId: data?.id ?? null,
    newData: {
      paymentIntentId: intent.id,
      gatewayPaymentId,
      agencyId: intent.agency_id,
      planId: intent.reference_id,
    },
  })
}

async function activatePromotion(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  intent: PaymentIntentRow,
  gatewayPaymentId: string | null,
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
    action: "stripe_promotion_activated",
    entityType: "promotion",
    entityId: data?.id ?? null,
    newData: {
      paymentIntentId: intent.id,
      gatewayPaymentId,
      agencyId: intent.agency_id,
      promotionType: type,
    },
  })
}

async function findIntent(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  input: { externalReference?: string | null; sessionId?: string | null; paymentIntentId?: string | null },
) {
  let query = supabase
    .from("payment_intents")
    .select("id,agency_id,product_type,reference_id,status,amount,external_reference,provider_payload")

  if (input.externalReference) {
    query = query.eq("external_reference", input.externalReference)
  } else if (input.sessionId) {
    query = query.eq("gateway_checkout_id", input.sessionId)
  } else if (input.paymentIntentId) {
    query = query.eq("gateway_payment_id", input.paymentIntentId)
  } else {
    return null
  }

  const { data } = await query.maybeSingle()
  return data as PaymentIntentRow | null
}

export async function POST(request: Request) {
  const payload = await request.text()

  if (!verifyStripeWebhookPayload(payload, request.headers.get("stripe-signature"))) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const event = JSON.parse(payload) as StripeEvent
  const supabase = createSupabaseAdminClient()

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const metadata = getSessionMetadata(session)
    const externalReference = getSessionString(session, "client_reference_id") ?? metadata.externalReference
    const sessionId = getSessionString(session, "id")
    const paymentIntentId = getSessionString(session, "payment_intent")
    const intent = await findIntent(supabase, {
      externalReference,
      sessionId,
      paymentIntentId,
    })

    if (!intent) {
      return NextResponse.json({ ok: true, ignored: "intent_not_found" })
    }

    await supabase
      .from("payment_intents")
      .update({
        status: "paid",
        gateway: "stripe",
        gateway_checkout_id: sessionId,
        gateway_payment_id: paymentIntentId,
        provider_payment_id: paymentIntentId,
        paid_at: new Date().toISOString(),
        failure_reason: null,
        provider_payload: {
          ...(intent.provider_payload ?? {}),
          stripeSession: session,
        },
      })
      .eq("id", intent.id)

    if (intent.status !== "paid") {
      if (intent.product_type === "subscription") {
        await activateSubscription(supabase, intent, paymentIntentId)
      }

      if (intent.product_type === "promotion") {
        await activatePromotion(supabase, intent, paymentIntentId)
      }
    }
  }

  if (
    event.type === "checkout.session.expired" ||
    event.type === "payment_intent.payment_failed" ||
    event.type === "payment_intent.canceled"
  ) {
    const object = event.data.object
    const metadata = getSessionMetadata(object)
    const externalReference = getSessionString(object, "client_reference_id") ?? metadata.externalReference
    const sessionId = event.type === "checkout.session.expired" ? getSessionString(object, "id") : null
    const paymentIntentId = event.type === "checkout.session.expired"
      ? getSessionString(object, "payment_intent")
      : getSessionString(object, "id")
    const intent = await findIntent(supabase, {
      externalReference,
      sessionId,
      paymentIntentId,
    })

    if (intent) {
      await supabase
        .from("payment_intents")
        .update({
          status: event.type === "checkout.session.expired" || event.type === "payment_intent.canceled" ? "canceled" : "failed",
          gateway: "stripe",
          gateway_checkout_id: sessionId,
          gateway_payment_id: paymentIntentId,
          provider_payment_id: paymentIntentId,
          failure_reason: event.type,
          provider_payload: {
            ...(intent.provider_payload ?? {}),
            stripeEvent: event,
          },
        })
        .eq("id", intent.id)
    }
  }

  return NextResponse.json({ ok: true })
}
