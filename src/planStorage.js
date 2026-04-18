import { supabase } from './supabase'

export async function getOverrides() {
  const { data, error } = await supabase.from('plan_overrides').select('producto_slug, overrides')
  if (error) throw error
  return Object.fromEntries((data || []).map(r => [r.producto_slug, r.overrides]))
}

export async function getOverride(productoSlug) {
  const { data, error } = await supabase
    .from('plan_overrides')
    .select('overrides')
    .eq('producto_slug', productoSlug)
    .maybeSingle()
  if (error) throw error
  return data?.overrides ?? {}
}

export async function saveOverride(productoSlug, newData) {
  const { data: { user } } = await supabase.auth.getUser()
  const current = await getOverride(productoSlug)
  const merged = { ...current, ...newData }
  const { error } = await supabase
    .from('plan_overrides')
    .upsert({
      producto_slug: productoSlug,
      overrides: merged,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
  if (error) throw error
}

export async function resetOverride(productoSlug) {
  const { error } = await supabase.from('plan_overrides').delete().eq('producto_slug', productoSlug)
  if (error) throw error
}
