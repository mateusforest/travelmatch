import { createHmac, timingSafeEqual } from "crypto"

type StripeCheckoutSessionInput = {
  title: string
  amount: number
  externalReference: string
  metadata?: Record<string, string>
}

type StripeCheckoutSession = {
  id: string
  url: string | null
  payment_intent?: string | null
  [key: string]: unknown
}

export type StripeEvent = {
  id: string
  type: string
  data: {
    object: Record<string, unknown>
  }
}

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.")
  }

  return key
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  return (configured || vercelUrl || "http://localhost:3000").replace(/\/$/, "")
}

function appendMetadata(params: URLSearchParams, prefix: string, metadata: Record<string, string>) {
  for (const [key, value] of Object.entries(metadata)) {
    params.append(prefix ? `${prefix}[metadata][${key}]` : `metadata[${key}]`, value)
  }
}

export async function createStripeCheckoutSession(input: StripeCheckoutSessionInput) {
  const siteUrl = getSiteUrl()
  const metadata = {
    externalReference: input.externalReference,
    ...(input.metadata ?? {}),
  }
  const params = new URLSearchParams()

  params.append("mode", "payment")
  params.append("client_reference_id", input.externalReference)
  params.append("success_url", `${siteUrl}/agencia/assinatura?payment=success`)
  params.append("cancel_url", `${siteUrl}/agencia/assinatura?payment=canceled`)
  params.append("line_items[0][quantity]", "1")
  params.append("line_items[0][price_data][currency]", "brl")
  params.append("line_items[0][price_data][unit_amount]", String(Math.round(input.amount * 100)))
  params.append("line_items[0][price_data][product_data][name]", input.title)
  appendMetadata(params, "", metadata)
  appendMetadata(params, "payment_intent_data", metadata)

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })
  const payload = (await response.json()) as StripeCheckoutSession

  if (!response.ok) {
    throw new Error(`Stripe checkout error: ${JSON.stringify(payload)}`)
  }

  if (!payload.url) {
    throw new Error("Stripe did not return a checkout URL.")
  }

  return {
    sessionId: payload.id,
    paymentIntentId: payload.payment_intent ?? null,
    checkoutUrl: payload.url,
    payload,
  }
}

export function verifyStripeWebhookPayload(payload: string, signatureHeader: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.")
  }

  if (!signatureHeader) return false

  const parts = signatureHeader.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split("=")
    if (!key || !value) return acc
    acc[key] = [...(acc[key] ?? []), value]
    return acc
  }, {})
  const timestamp = parts.t?.[0]
  const signatures = parts.v1 ?? []

  if (!timestamp || signatures.length === 0) return false

  const signedPayload = `${timestamp}.${payload}`
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex")

  return signatures.some((signature) => {
    const expectedBuffer = Buffer.from(expected, "hex")
    const signatureBuffer = Buffer.from(signature, "hex")
    return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer)
  })
}
