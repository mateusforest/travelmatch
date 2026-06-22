"use server"

import { generatePackageDescriptionWithCos } from "@/lib/cos"

type GeneratePackageDescriptionInput = {
  title?: string
  destination: string
  durationDays?: string
  categoryName?: string
  priceFrom?: string
}

export async function generatePackageDescription(input: GeneratePackageDescriptionInput) {
  const result = await generatePackageDescriptionWithCos(input)

  return {
    ok: true,
    description: result.text,
    message: result.usedFallback
      ? result.message ?? "COS gerou uma sugestão segura com base nos dados informados."
      : undefined,
    usedFallback: result.usedFallback,
  }
}
