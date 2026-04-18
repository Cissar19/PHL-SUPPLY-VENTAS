import { supabase } from './supabase'

function rowToCot(row) {
  return {
    ...row.data,
    id: row.id,
    fecha: row.created_at,
    estado: row.estado ?? 'pendiente',
    nota: row.nota ?? '',
  }
}

export async function getCotizaciones() {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(rowToCot)
}

export async function saveCotizacion(data) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: row, error } = await supabase
    .from('cotizaciones')
    .insert({
      vendedor_id: user.id,
      estado: 'pendiente',
      producto_nombre: data.productoNombre ?? null,
      valor_con_descuento: data.valorConDescuento ?? null,
      comision_uf: data.comision?.uf ?? null,
      data,
    })
    .select()
    .single()
  if (error) throw error
  return rowToCot(row)
}

export async function deleteCotizacion(id) {
  const { error } = await supabase.from('cotizaciones').delete().eq('id', id)
  if (error) throw error
}

export async function updateCotizacion(id, changes) {
  const update = { updated_at: new Date().toISOString() }
  if ('estado' in changes) update.estado = changes.estado
  if ('nota' in changes) update.nota = changes.nota
  const { data: row, error } = await supabase
    .from('cotizaciones')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return rowToCot(row)
}
