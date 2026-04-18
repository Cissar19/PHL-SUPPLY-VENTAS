// Tablas de comisiones y premios por producto, clasificación y cantidad de sepulturas
// Los valores por defecto se sobreescriben con datos de la DB al iniciar.

// Tabla estándar para sepulturas (Tradicional, Integra, Integra Premium, SB, Premium Los Olivos)
let TABLA_SEPULTURAS = {
  byRange: [
    { desde: 1, hasta: 1, A: { com: 4,    premios: [{c:2,p:1}] },
                           B: { com: 1.5,  premios: [{c:2,p:1},{c:4,p:1},{c:6,p:1}] },
                           C: { com: 0.5,  premios: [{c:2,p:1},{c:4,p:1},{c:6,p:1},{c:7,p:0.5}] } },
    { desde: 2, hasta: 2, A: { com: 8,    premios: [{c:2,p:2}] },
                           B: { com: 3,    premios: [{c:2,p:2},{c:4,p:2},{c:6,p:2}] },
                           C: { com: 1,    premios: [{c:2,p:2},{c:4,p:2},{c:6,p:2},{c:7,p:1}] } },
    { desde: 3, hasta: 5, A: { com: 9.6,  premios: [{c:2,p:2.4}] },
                           B: { com: 3.6,  premios: [{c:2,p:2.4},{c:4,p:2.4},{c:6,p:2.4}] },
                           C: { com: 1.2,  premios: [{c:2,p:2.4},{c:4,p:2.4},{c:6,p:2.4},{c:7,p:1.2}] } },
    { desde: 6, hasta: null, A: { com: 10.4, premios: [{c:2,p:2.6}] },
                              B: { com: 3.9,  premios: [{c:2,p:2.6},{c:4,p:2.6},{c:6,p:2.6}] },
                              C: { com: 1.3,  premios: [{c:2,p:2.6},{c:4,p:2.6},{c:6,p:2.6},{c:7,p:1.3}] } },
  ],
}

// Tabla para Aumento de Capacidad y Mausoleos Premium (mismo %)
let TABLA_AUMENTO_MAUSOLEO = {
  byRange: [
    { desde: 1, hasta: null, A: { com: 8, premios: [{c:2,p:2}] },
                              B: { com: 3, premios: [{c:2,p:2},{c:4,p:2},{c:6,p:2}] },
                              C: { com: 1, premios: [{c:2,p:2},{c:4,p:2},{c:6,p:2},{c:7,p:1}] } },
  ],
}

// Tabla para Liberador de Mantención (solo A y C)
let TABLA_LIBERADOR = {
  byRange: [
    { desde: 1, hasta: null, A: { com: 5, premios: [] },
                              C: { com: 0.7, premios: [{c:2,p:1.2},{c:4,p:1.2},{c:6,p:1.2},{c:7,p:0.7}] } },
  ],
}

// Cineración NF: A4%/B1.5%/C0.5% — equivale a 1 sepultura (rango único)
let TABLA_CINERACION_NF = {
  byRange: [
    { desde: 1, hasta: null,
      A: { com: 4,   premios: [{c:2,p:1}] },
      B: { com: 1.5, premios: [{c:2,p:1},{c:4,p:1},{c:6,p:1}] },
      C: { com: 0.5, premios: [{c:2,p:1},{c:4,p:1},{c:6,p:1},{c:7,p:0.5}] },
    },
  ],
}

let TABLAS_POR_PRODUCTO = {
  'sepultura-tradicional':        TABLA_SEPULTURAS,
  'sepultura-integra':            TABLA_SEPULTURAS,
  'sepultura-integra-premium':    TABLA_SEPULTURAS,
  'sepultura-sb':                 TABLA_SEPULTURAS,
  'sepultura-premium-los-olivos': TABLA_SEPULTURAS,
  'aumento-de-capacidad':         TABLA_AUMENTO_MAUSOLEO,
  'liberador-de-mantencion':      TABLA_LIBERADOR,
  'mausoleos-premium':            TABLA_AUMENTO_MAUSOLEO,
  'cineracion-nf':                TABLA_CINERACION_NF,
  'columbario-jardin-cenizas':    TABLA_AUMENTO_MAUSOLEO,
  'columbario-construido':        TABLA_AUMENTO_MAUSOLEO,
  'columbario-plus':              TABLA_AUMENTO_MAUSOLEO,
}

// Comisiones planas (sin clasificación): funeraria simple + cinerario simple
let COMISIONES_PLANAS = {
  'servicio-funerario-tradicional':  { com: 5, activacionFNP: 3 },
  'servicio-funerario-esencial':     { com: 5, activacionFNP: 3 },
  'servicio-funerario-nf':           { com: 10, activacionFNP: null },
  'cineracion-linea-inicial':        { com: 5, activacionFNP: null },
  'cineracion-linea-homenaje':       { com: 5, activacionFNP: null },
  'cineracion-linea-gran-homenaje':  { com: 5, activacionFNP: null },
}

// Aplica tablas cargadas desde la DB
export function applyCommissionOverrides(tables) {
  if (tables.sepulturas)       TABLA_SEPULTURAS = tables.sepulturas
  if (tables.aumento_mausoleo) TABLA_AUMENTO_MAUSOLEO = tables.aumento_mausoleo
  if (tables.liberador)        TABLA_LIBERADOR = tables.liberador
  if (tables.cineracion_nf)    TABLA_CINERACION_NF = tables.cineracion_nf
  if (tables.planas)           COMISIONES_PLANAS = tables.planas

  TABLAS_POR_PRODUCTO = {
    'sepultura-tradicional':        TABLA_SEPULTURAS,
    'sepultura-integra':            TABLA_SEPULTURAS,
    'sepultura-integra-premium':    TABLA_SEPULTURAS,
    'sepultura-sb':                 TABLA_SEPULTURAS,
    'sepultura-premium-los-olivos': TABLA_SEPULTURAS,
    'aumento-de-capacidad':         TABLA_AUMENTO_MAUSOLEO,
    'liberador-de-mantencion':      TABLA_LIBERADOR,
    'mausoleos-premium':            TABLA_AUMENTO_MAUSOLEO,
    'cineracion-nf':                TABLA_CINERACION_NF,
    'columbario-jardin-cenizas':    TABLA_AUMENTO_MAUSOLEO,
    'columbario-construido':        TABLA_AUMENTO_MAUSOLEO,
    'columbario-plus':              TABLA_AUMENTO_MAUSOLEO,
  }
}

export function calcularComision(valorVenta, productoSlug, numSepulturas, clasificacion) {
  if (!valorVenta || !productoSlug) return null

  // Planas (funeraria simple + cinerario simple): sin clasificación
  if (productoSlug in COMISIONES_PLANAS) {
    const cf = COMISIONES_PLANAS[productoSlug]
    return {
      porcentaje: cf.com,
      uf: valorVenta * cf.com / 100,
      activacionFNP: cf.activacionFNP
        ? { porcentaje: cf.activacionFNP, uf: valorVenta * cf.activacionFNP / 100 }
        : null,
      premios: [],
    }
  }

  // Sepulturas / complementarios: requieren clasificación
  if (!clasificacion) return null
  const tabla = TABLAS_POR_PRODUCTO[productoSlug]
  if (!tabla) return null

  const n = parseInt(numSepulturas) || 1
  const rango = tabla.byRange.find(r => n >= r.desde && (r.hasta === null || n <= r.hasta))
  if (!rango) return null

  const entry = rango[clasificacion]
  if (!entry) return null

  return {
    porcentaje: entry.com,
    uf: valorVenta * entry.com / 100,
    activacionFNP: null,
    premios: entry.premios.map(p => ({
      cuota: p.c,
      porc: p.p,
      uf: valorVenta * p.p / 100,
    })),
  }
}
