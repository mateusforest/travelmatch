"use server"

import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createCheckoutIntentPayload } from "@/lib/payments"
import { createStripeCheckoutSession } from "@/lib/stripe"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type PlanSlug = "pro" | "premium"
type PromotionType = "featured_7" | "featured_15" | "featured_30" | "boost"

const promotionProducts: Record<PromotionType, { title: string; amount: number; days: number | null }> = {
  featured_7: { title: "Destaque 7 dias", amount: 97, days: 7 },
  featured_15: { title: "Destaque 15 dias", amount: 197, days: 15 },
  featured_30: { title: "Destaque 30 dias", amount: 497, days: 30 },
  boost: { title: "TravelMatch Boost", amount: 987, days: null },
}

async function requireAgency() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Sessao expirada. Faca login novamente.")
  }

  const { data: agency, error } = await supabase
    .from("agency_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !agency) {
    throw new Error("Perfil da agencia nao encontrado.")
  }

  return { supabase, agencyId: agency.id as string }
}

export async function checkoutSubscription(planSlug: PlanSlug) {
  const { supabase, agencyId } = await requireAgency()

  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("id,slug,name,price")
    .eq("slug", planSlug)
    .eq("active", true)
    .maybeSingle()

  if (planError || !plan) {
    throw new Error("Plano nao encontrado.")
  }

  const externalReference = `tm_${randomUUID()}`
  const amount = Number(plan.price ?? 0)
  const session = await createStripeCheckoutSession({
    title: `TravelMatch ${plan.name}`,
    amount,
    externalReference,
    metadata: {
      agencyId,
      productType: "subscription",
      planSlug,
      planId: plan.id as string,
    },
  })

  const { error: intentError } = await supabase
    .from("payment_intents")
    .insert({
      ...createCheckoutIntentPayload({
        provider: "stripe",
        agencyId,
        productType: "subscription",
        referenceId: plan.id as string,
        amount,
      }),
      gateway: "stripe",
      external_reference: externalReference,
      checkout_url: session.checkoutUrl,
      gateway_checkout_id: session.sessionId,
      gateway_payment_id: session.paymentIntentId,
      provider_payload: {
        planSlug,
        checkoutSession: session.payload,
      },
    })

  if (intentError) {
    throw new Error(intentError?.message ?? "Nao foi possivel iniciar o pagamento.")
  }

  redirect(session.checkoutUrl)
}

export async function checkoutPromotion(type: PromotionType) {
  const { supabase, agencyId } = await requireAgency()
  const product = promotionProducts[type]
  const externalReference = `tm_${randomUUID()}`
  const session = await createStripeCheckoutSession({
    title: product.title,
    amount: product.amount,
    externalReference,
    metadata: {
      agencyId,
      productType: "promotion",
      promotionType: type,
    },
  })

  const { error: intentError } = await supabase
    .from("payment_intents")
    .insert({
      ...createCheckoutIntentPayload({
        provider: "stripe",
        agencyId,
        productType: "promotion",
        referenceId: null,
        amount: product.amount,
      }),
      gateway: "stripe",
      external_reference: externalReference,
      checkout_url: session.checkoutUrl,
      gateway_checkout_id: session.sessionId,
      gateway_payment_id: session.paymentIntentId,
      provider_payload: {
        promotionType: type,
        days: product.days,
        checkoutSession: session.payload,
      },
    })

  if (intentError) {
    throw new Error(intentError?.message ?? "Nao foi possivel iniciar o pagamento.")
  }

  redirect(session.checkoutUrl)
}

export async function cancelAgencySubscription() {
  const { supabase, agencyId } = await requireAgency()
  const now = new Date().toISOString()
  const { error } = await supabase
    .from("agency_subscriptions")
    .update({ status: "canceled", canceled_at: now })
    .eq("agency_id", agencyId)
    .in("status", ["trial", "active"])

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/agencia/assinatura")
}
