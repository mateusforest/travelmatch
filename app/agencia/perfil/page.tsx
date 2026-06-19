import { getAgencyProfile } from "@/lib/data/agency"
import { PerfilForm } from "./perfil-form"

export default async function PerfilPublicoPage() {
  const profile = await getAgencyProfile()

  return <PerfilForm profile={profile} />
}
