// Catálogo derivado de nuestros_parques_db.sql — válido desde marzo 2026

export const PARQUES = [
  { slug: 'el-manantial', nombre: 'El Manantial' },
  { slug: 'santiago',     nombre: 'Santiago' },
  { slug: 'canaan',       nombre: 'Canaán' },
  { slug: 'la-foresta',   nombre: 'La Foresta' },
  { slug: 'el-prado',     nombre: 'El Prado' },
]

// Precios fijos por parque y capacidad (null parque = todos los parques)
const PRECIOS_INTEGRA = {
  'el-manantial': { 2: 107, 3: 112, 4: 117 },
  'santiago':     { 2: 107, 3: 112, 4: 117 },
  'canaan':       { 2: 107, 3: 112, 4: 117 },
  'la-foresta':   { 2: 112, 3: 117, 4: 122 },
}

const PRECIOS_INTEGRA_PREMIUM = {
  'el-manantial': { 2: 110, 3: 120, 4: 130 },
  'santiago':     { 2: 110, 3: 120, 4: 130 },
  'canaan':       { 2: 110, 3: 120, 4: 130 },
  'la-foresta':   { 2: 115, 3: 125, 4: 135 },
}

const PRECIOS_SB = {
  'el-manantial': { 2: 97, 3: 107, 4: 112 },
  'santiago':     { 2: 97, 3: 107, 4: 112 },
  'canaan':       { 2: 97, 3: 107, 4: 112 },
  'la-foresta':   { 2: 102, 3: 112, 4: 117 },
}

// Aumento de capacidad: precio por parque + capacidades_adicionales
const PRECIOS_AUMENTO = {
  'el-prado': { 1: 80, 2: 100 },
  _otros:     { 1: 45, 2: 80 },
}

// Mausoleos: mismo precio en todos los parques
const PRECIOS_MAUSOLEO = { 1: 100, 2: 180, 3: 240, 4: 280 }

export const PRODUCTOS = [
  {
    slug: 'sepultura-tradicional',
    nombre: 'Sepultura Tradicional',
    familia: 'Sepultura',
    capacidades: [2, 3, 4, 8],
    labelCapacidad: 'Capacidad',
    mantencion: 2.74,
    condiciones: {
      pieMin: 3,
      pieMinPorParque: { 'el-prado': 5 },
      cuotasMax: 108,
      carencia: true,
    },
    getPrecio: () => null, // manual
    noDisponibleEn: [],
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: true,
  },
  {
    slug: 'sepultura-integra',
    nombre: 'Sepultura Integra',
    familia: 'Sepultura',
    capacidades: [2, 3, 4],
    labelCapacidad: 'Capacidad',
    mantencion: 2.74,
    condiciones: {
      pieMin: 15,
      cuotasMax: 108,
      carencia: false,
    },
    getPrecio: (parqueSlug, cap) => PRECIOS_INTEGRA[parqueSlug]?.[cap] ?? null,
    noDisponibleEn: ['el-prado'],
    zona: 3,
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: true,
  },
  {
    slug: 'sepultura-integra-premium',
    nombre: 'Sepultura Integra Premium',
    familia: 'Sepultura',
    capacidades: [2, 3, 4],
    labelCapacidad: 'Capacidad',
    mantencion: 2.74,
    condiciones: {
      pieMin: 10,
      cuotasMax: 108,
      carencia: false,
    },
    getPrecio: (parqueSlug, cap) => PRECIOS_INTEGRA_PREMIUM[parqueSlug]?.[cap] ?? null,
    noDisponibleEn: ['el-prado'],
    zona: 3,
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: true,
  },
  {
    slug: 'sepultura-sb',
    nombre: 'Sepultura SB (Sin Beneficios)',
    familia: 'Sepultura',
    capacidades: [2, 3, 4],
    labelCapacidad: 'Capacidad',
    mantencion: 2.74,
    condiciones: {
      pieMin: 15,
      cuotasMax: 108,
      carencia: false,
    },
    getPrecio: (parqueSlug, cap) => PRECIOS_SB[parqueSlug]?.[cap] ?? null,
    noDisponibleEn: ['el-prado'],
    zona: 3,
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: true,
  },
  {
    slug: 'sepultura-premium-los-olivos',
    nombre: 'Sepultura Premium Los Olivos',
    familia: 'Sepultura',
    capacidades: [4],
    labelCapacidad: 'Capacidad',
    mantencion: 2.74,
    condiciones: {
      pieMin: 5,
      cuotasMax: 108,
      carencia: false,
      descuentoMax: 15,
    },
    getPrecio: () => null, // manual
    noDisponibleEn: [],
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: true,
  },
  {
    slug: 'aumento-de-capacidad',
    nombre: 'Aumento de Capacidad',
    familia: 'Complementario',
    capacidades: [1, 2],
    labelCapacidad: 'Capacidades adicionales',
    mantencion: null,
    condiciones: {
      pieMin: 5,
      cuotasMax: 108,
      carencia: false,
    },
    getPrecio: (parqueSlug, cap) => {
      const tabla = parqueSlug === 'el-prado' ? PRECIOS_AUMENTO['el-prado'] : PRECIOS_AUMENTO['_otros']
      return tabla?.[cap] ?? null
    },
    noDisponibleEn: [],
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: false,
  },
  {
    slug: 'liberador-de-mantencion',
    nombre: 'Liberador de Mantención',
    familia: 'Complementario',
    capacidades: [10, 20, 30, 40, 50, 99],
    labelCapacidad: 'Años contratados',
    mantencion: null,
    condiciones: {
      pieMin: 5,
      cuotasMax: 36,
      carencia: false,
    },
    getPrecio: () => null, // manual
    noDisponibleEn: [],
    clasificaciones: ['A', 'C'], // no tiene B
    comisionPorSepulturas: false,
  },
  {
    slug: 'mausoleos-premium',
    nombre: 'Mausoleos Premium',
    familia: 'Mausoleo',
    tipo: 'sepultura',
    capacidades: [1, 2, 3, 4],
    labelCapacidad: 'Capacidad',
    mantencion: 2.74,
    condiciones: {
      pieMin: 5,
      cuotasMax: 108,
      carencia: true,
      carenciaMeses: 6,
      descuentoMax: 15,
    },
    getPrecio: (_parqueSlug, cap) => PRECIOS_MAUSOLEO[cap] ?? null,
    noDisponibleEn: [],
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: false,
  },
  // ── Funeraria ──────────────────────────────────────────────
  {
    slug: 'servicio-funerario-tradicional',
    nombre: 'Servicio Funerario Tradicional',
    familia: 'Funeraria',
    tipo: 'funeraria-simple',
    capacidades: [1],
    labelCapacidad: 'Servicios',
    mantencion: null,
    condiciones: { cuotasMax: null, carencia: false },
    getPrecio: () => null,
    noDisponibleEn: [],
    clasificaciones: [],
    comisionPorSepulturas: false,
    precioDescripcion: 'Entre $1.100.000 y $5.000.000 IVA incluido, según modelo de urna',
  },
  {
    slug: 'servicio-funerario-esencial',
    nombre: 'Servicio Funerario Esencial',
    familia: 'Funeraria',
    tipo: 'funeraria-simple',
    capacidades: [1],
    labelCapacidad: 'Servicios',
    mantencion: null,
    condiciones: { cuotasMax: null, carencia: false },
    getPrecio: () => null,
    noDisponibleEn: [],
    clasificaciones: [],
    comisionPorSepulturas: false,
    precioDescripcion: 'Valor de Cuota Mortuoria AFP o IPS',
  },
  {
    slug: 'servicio-funerario-nf',
    nombre: 'Servicio Funerario NF',
    familia: 'Funeraria',
    tipo: 'funeraria-nf',
    capacidades: [1, 2, 3, 4],
    labelCapacidad: 'N° de servicios',
    mantencion: null,
    condiciones: { pieMin: 10, cuotasMax: 48, carencia: true, carenciaMeses: 12 },
    getPrecio: () => null, // se obtiene de PLANES_NF
    noDisponibleEn: [],
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: false,
    cuotaActivacionUF: 15,
  },
  // ── Cinerario ─────────────────────────────────────────────
  {
    slug: 'cineracion-linea-inicial',
    nombre: 'Línea Inicial Cineración',
    familia: 'Cinerario',
    tipo: 'cinerario-simple',
    capacidades: [1],
    labelCapacidad: 'Cineraciones',
    mantencion: null,
    condiciones: { cuotasMax: null, carencia: false },
    getPrecio: () => 25,
    noDisponibleEn: [],
    clasificaciones: [],
    comisionPorSepulturas: false,
  },
  {
    slug: 'cineracion-nf',
    nombre: 'Cineración NF (Necesidad Futura)',
    familia: 'Cinerario',
    tipo: 'cinerario-nf',
    capacidades: [1, 2, 3, 4],
    labelCapacidad: 'N° de cineraciones',
    mantencion: null,
    condiciones: { pieMin: 10, cuotasMax: 48, carencia: true, carenciaMeses: 12 },
    getPrecio: (_parque, cap) => ({ 1: 30, 2: 52, 3: 70, 4: 82 }[cap] ?? null),
    noDisponibleEn: [],
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: false,
  },
  {
    slug: 'cineracion-linea-homenaje',
    nombre: 'Línea Homenaje Cineración',
    familia: 'Cinerario',
    tipo: 'cinerario-simple',
    capacidades: [1],
    labelCapacidad: 'Cineraciones',
    mantencion: null,
    condiciones: { cuotasMax: null, carencia: false },
    getPrecio: () => 33,
    noDisponibleEn: [],
    clasificaciones: [],
    comisionPorSepulturas: false,
  },
  {
    slug: 'cineracion-linea-gran-homenaje',
    nombre: 'Línea Gran Homenaje Cineración',
    familia: 'Cinerario',
    tipo: 'cinerario-simple',
    capacidades: [1],
    labelCapacidad: 'Cineraciones',
    mantencion: null,
    condiciones: { cuotasMax: null, carencia: false },
    getPrecio: () => 40,
    noDisponibleEn: [],
    clasificaciones: [],
    comisionPorSepulturas: false,
  },
  {
    slug: 'columbario-jardin-cenizas',
    nombre: 'Columbario Jardín de Cenizas',
    familia: 'Cinerario',
    tipo: 'columbario',
    capacidades: [2],
    labelCapacidad: 'Capacidad',
    mantencion: 0.50,
    condiciones: { pieMin: 10, cuotasMax: 48, carencia: false },
    getPrecio: () => 40,
    noDisponibleEn: [],
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: false,
  },
  {
    slug: 'columbario-construido',
    nombre: 'Columbario Construido',
    familia: 'Cinerario',
    tipo: 'columbario',
    capacidades: [1, 2, 3, 4],
    labelCapacidad: 'Capacidad',
    mantencion: 0.50,
    condiciones: { pieMin: 10, cuotasMax: 48, carencia: false },
    getPrecio: () => 75, // precio lista base; Fila A: -10%, Fila D: -20%
    noDisponibleEn: ['santiago', 'canaan', 'la-foresta', 'el-prado'],
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: false,
    precioDescripcion: 'Precio lista 75 UF · Fila A: 10% dto (68 UF) · Fila D: 20% dto (60 UF)',
  },
  {
    slug: 'columbario-plus',
    nombre: 'Columbario Plus',
    familia: 'Cinerario',
    tipo: 'columbario',
    capacidades: [2, 4],
    labelCapacidad: 'Capacidad',
    mantencion: 0.50,
    condiciones: { pieMin: 10, cuotasMax: 48, carencia: true, carenciaMeses: 12 },
    getPrecio: () => null, // variable por parque y modalidad
    noDisponibleEn: [],
    clasificaciones: ['A', 'B', 'C'],
    comisionPorSepulturas: false,
    precioDescripcion: 'Precio variable según parque y modalidad (jardín/construido + 1 o 2 cineraciones)',
  },
]

// Planes NF: tabla específica por código × número de servicios
export const PLANES_NF = [
  { codigo: 670, nombre: 'Servicio Funerario Inicial',       precios: { 1: 35.0,  2: 66.7,  3: 88.0,  4: 109.4 } },
  { codigo: 671, nombre: 'Servicio Funerario Plus',          precios: { 1: 40.0,  2: 72.1,  3: 98.7,  4: 121.7 } },
  { codigo: 672, nombre: 'Servicio Funerario Homenaje',      precios: { 1: 50.0,  2: 88.9,  3: 120.2, 4: 146.4 } },
  { codigo: 673, nombre: 'Servicio Funerario Homenaje Plus', precios: { 1: 60.0,  2: 102.7, 3: 141.7, 4: 171.1 } },
  { codigo: 674, nombre: 'Servicio Funerario Gran Homenaje', precios: { 1: 80.0,  2: 139.4, 3: 184.7, 4: 220.4 } },
]

export function getPrecioNF(codigoNF, numServicios) {
  const plan = PLANES_NF.find(p => p.codigo === codigoNF)
  return plan?.precios[numServicios] ?? null
}

export function getProducto(slug) {
  return PRODUCTOS.find(p => p.slug === slug)
}

export function getParquesDisponibles(productoSlug) {
  const prod = getProducto(productoSlug)
  if (!prod) return PARQUES
  return PARQUES.filter(p => !prod.noDisponibleEn.includes(p.slug))
}

export function getPieMin(productoSlug, parqueSlug) {
  const prod = getProducto(productoSlug)
  if (!prod) return 0
  return prod.condiciones.pieMinPorParque?.[parqueSlug] ?? prod.condiciones.pieMin ?? 0
}
