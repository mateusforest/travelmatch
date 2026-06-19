export type PaymentProvider = "stripe" | "mercado_pago"

export type CheckoutIntentInput = {
  provider: PaymentProvider
  agencyId: string
  productType: "subscription" | "promotion"
  referenceId?: string | null
  amount: number
  currency?: string
}

export function createCheckoutIntentPayload(input: CheckoutIntentInput) {
  return {
    agency_id: input.agencyId,
    provider: input.provider,
    product_type: input.productType,
    reference_id: input.referenceId ?? null,
    status: "pending",
    amount: input.amount,
    currency: input.currency ?? "BRL",
  }
}

export const paymentProviders = {
  stripe: {
    name: "Stripe",
    checkoutReady: false,
  },
  mercado_pago: {
    name: "Mercado Pago",
    checkoutReady: false,
  },
} as const
