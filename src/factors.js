// Tabla de factores para ventas a crédito — Vigencia: Febrero 2026
// factor_1ra_cuota = factor multiplicador sobre el saldo financiado

// Valores por defecto (se sobreescriben con datos de la DB al iniciar)
let _FACTORES_SEPULTURA_UF = {
  18:  0.05857,
  24:  0.04466,
  36:  0.03076,
  48:  0.02383,
  60:  0.01968,
  72:  0.01693,
  84:  0.01497,
  96:  0.01361,
  108: 0.01238,
}

let _FACTORES_LIBERADOR_UF = {
  12: 0.08641,
  18: 0.05857,
  24: 0.04466,
  30: 0.03632,
  36: 0.03076,
}

// Aplica tablas cargadas desde la DB (tabla_key → {cuotas: factor})
export function applyFactorOverrides(tables) {
  if (tables.sepultura_uf) {
    _FACTORES_SEPULTURA_UF = {}
    for (const [k, v] of Object.entries(tables.sepultura_uf)) {
      _FACTORES_SEPULTURA_UF[Number(k)] = v
    }
  }
  if (tables.liberador_uf) {
    _FACTORES_LIBERADOR_UF = {}
    for (const [k, v] of Object.entries(tables.liberador_uf)) {
      _FACTORES_LIBERADOR_UF[Number(k)] = v
    }
  }
}

// Columbarios usan la misma tasa que sepulturas (alias al cierre del módulo)

// NF (Funeraria NF, Cineración NF): venta sin interés en UF → factor = 1/n
function factorSinInteres(cuotas) {
  return cuotas > 0 ? 1 / cuotas : null
}

// Productos que usan factor sin interés (0%)
const SLUGS_SIN_INTERES = new Set([
  'servicio-funerario-nf',
  'cineracion-nf',
])

// Productos que usan tabla Liberador
const SLUGS_LIBERADOR = new Set([
  'liberador-de-mantencion',
])

// Productos que usan tabla Columbario
const SLUGS_COLUMBARIO = new Set([
  'columbario-jardin-cenizas',
  'columbario-construido',
  'columbario-plus',
])

export function getFactor(productoSlug, cuotas) {
  if (!cuotas || !productoSlug) return null
  if (SLUGS_SIN_INTERES.has(productoSlug)) return factorSinInteres(cuotas)
  if (SLUGS_LIBERADOR.has(productoSlug))   return _FACTORES_LIBERADOR_UF[cuotas] ?? null
  if (SLUGS_COLUMBARIO.has(productoSlug))  return _FACTORES_SEPULTURA_UF[cuotas] ?? null
  return _FACTORES_SEPULTURA_UF[cuotas] ?? null
}

// Cuotas disponibles por tipo de producto
export const CUOTAS_SEPULTURA  = [18, 24, 36, 48, 60, 72, 84, 96, 108]
export const CUOTAS_LIBERADOR  = [12, 18, 24, 30, 36]
export const CUOTAS_COLUMBARIO = [18, 24, 36, 48]
export const CUOTAS_NF         = [12, 18, 24, 36, 48]

export function getCuotasForProducto(productoSlug, cuotasMax) {
  let base
  if (SLUGS_SIN_INTERES.has(productoSlug))  base = CUOTAS_NF
  else if (SLUGS_LIBERADOR.has(productoSlug)) base = CUOTAS_LIBERADOR
  else if (SLUGS_COLUMBARIO.has(productoSlug)) base = CUOTAS_COLUMBARIO
  else base = CUOTAS_SEPULTURA
  if (!cuotasMax) return base
  return base.filter(c => c <= cuotasMax)
}
