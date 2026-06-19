"use server"

import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type SignUpInput = {
  agencia: string
  responsavel: string
  email: string
  telefone: string
  cidade: string
  estado: string
  senha: string
}

export async function signUpAgency(input: SignUpInput) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.senha,
    options: {
      data: {
        account_type: "agency",
        agency_name: input.agencia,
        responsible_name: input.responsavel,
        email: input.email,
        phone: input.telefone,
        city: input.cidade,
        state: input.estado,
      },
    },
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  redirect("/agencia")
}

export async function signInUser(email: string, password: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { ok: false, message: "E-mail ou senha inválidos." }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, message: "Não foi possível iniciar a sessão." }
  }

  const { data: masterUser } = await supabase
    .from("master_users")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  redirect(masterUser ? "/master" : "/agencia")
}

export async function signOutUser() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/entrar")
}
