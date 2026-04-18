const CACHE_KEY = 'uf_daily_cache'

function todayStr() {
  return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

export async function fetchUF() {
  // Return cached value if fetched today
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    if (cached?.date === todayStr() && cached?.value) {
      return cached.value
    }
  } catch {}

  const res = await fetch('https://mindicador.cl/api/uf')
  if (!res.ok) throw new Error('Error al obtener UF')
  const data = await res.json()
  const value = data.serie?.[0]?.valor
  if (!value) throw new Error('Respuesta inválida')

  localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayStr(), value }))
  return value
}

export function formatCLP(uf, ufValue) {
  if (uf === null || uf === undefined || !ufValue) return null
  const clp = Math.round(Number(uf) * ufValue)
  return `$${clp.toLocaleString('es-CL')}`
}
