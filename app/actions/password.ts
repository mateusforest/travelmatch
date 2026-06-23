"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getSiteUrl } from "@/lib/stripe"

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    return { ok: false, message: "Informe seu e-mail." }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/redefinir-senha`,
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  return {
    ok: true,
    message: "Enviamos um link de redefinição para o e-mail informado.",
  }
}

export async function updatePassword(password: string) {
  if (password.length < 6) {
    return { ok: false, message: "A senha deve ter ao menos 6 caracteres." }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { ok: false, message: error.message }
  }

  return { ok: true, message: "Senha atualizada com sucesso." }
}
