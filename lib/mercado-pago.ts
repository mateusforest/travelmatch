type MercadoPagoPreferenceInput = {
  title: string
  amount: number
  externalReference: string
  metadata?: Record<string, unknown>
}

type MercadoPagoPreferenceResponse = {
  id?: string
  init_point?: string
  sandbox_init_point?: string
  [key: string]: unknown
}

type MercadoPagoPaymentResponse = {
  id?: number | string
  status?: string
  status_detail?: string
  external_reference?: string
  transaction_amount?: number
  [key: string]: unknown
}

function getMercadoPagoToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN is not configured.")
  }

  return token
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  return (configured || vercelUrl || "http://localhost:3000").replace(/\/$/, "")
}

export async function createMercadoPagoPreference(input: MercadoPagoPreferenceInput) {
  const siteUrl = getSiteUrl()
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getMercadoPagoToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: input.title,
          quantity: 1,
          unit_price: input.amount,
          currency_id: "BRL",
        },
      ],
      external_reference: input.externalReference,
      notification_url: `${siteUrl}/api/webhooks/mercado-pago`,
      back_urls: {
        success: `${siteUrl}/agencia/assinatura?payment=success`,
        pending: `${siteUrl}/agencia/assinatura?payment=pending`,
        failure: `${siteUrl}/agencia/assinatura?payment=failure`,
      },
      auto_return: "approved",
      metadata: input.metadata ?? {},
    }),
  })

  const payload = (await response.json()) as MercadoPagoPreferenceResponse

  if (!response.ok) {
    throw new Error(`Mercado Pago checkout error: ${JSON.stringify(payload)}`)
  }

  const checkoutUrl = payload.init_point || payload.sandbox_init_point
  if (!checkoutUrl || typeof checkoutUrl !== "string") {
    throw new Error("Mercado Pago did not return a checkout URL.")
  }

  return {
    preferenceId: typeof payload.id === "string" ? payload.id : null,
    checkoutUrl,
    payload,
  }
}

export async function getMercadoPagoPayment(paymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${getMercadoPagoToken()}`,
    },
    cache: "no-store",
  })

  const payload = (await response.json()) as MercadoPagoPaymentResponse

  if (!response.ok) {
    throw new Error(`Mercado Pago payment lookup error: ${JSON.stringify(payload)}`)
  }

  return payload
}

export function isMercadoPagoWebhookAllowed(request: Request) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
  if (!secret) return true

  const url = new URL(request.url)
  const headerSecret = request.headers.get("x-webhook-secret")
  const querySecret = url.searchParams.get("secret")

  return headerSecret === secret || querySecret === secret
}
