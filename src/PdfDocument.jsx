import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'

// ── Fonts ──────────────────────────────────────────────────────────────────
Font.register({
  family: 'Geist',
  fonts: [
    { src: '/fonts/Geist-Regular.ttf',  fontWeight: 400 },
    { src: '/fonts/Geist-Medium.ttf',   fontWeight: 500 },
    { src: '/fonts/Geist-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Geist-Bold.ttf',     fontWeight: 700 },
  ],
})
Font.register({
  family: 'Fraunces',
  fonts: [
    { src: '/fonts/Fraunces-Bold.woff',      fontWeight: 700 },
    { src: '/fonts/Fraunces-ExtraBold.woff', fontWeight: 800 },
    { src: '/fonts/Fraunces-Black.woff',     fontWeight: 900 },
  ],
})

// ── Colors ─────────────────────────────────────────────────────────────────
const C = {
  deep:     '#173530',   // oklch(29% 0.06 193)
  mid:      '#1d4d47',   // oklch(38% 0.07 193)
  soft:     '#e8f2f0',   // oklch(94% 0.012 193)
  gold:     '#c9a535',   // oklch(83% 0.13 85)
  ink:      '#1d2222',   // oklch(18% 0.01 193)
  muted:    '#737b7a',   // oklch(52% 0.02 193)
  rule:     '#d4dedd',   // oklch(86% 0.012 193)
  bg:       '#f7fbfa',   // oklch(98.5% 0.005 193)
  footerbg: '#eff5f3',
  dimgreen: '#5a8a82',   // muted green (on dark bg)
  amber_bg: '#fdf0e0',
  amber_br: '#e0b870',
  amber_tx: '#7a5010',
  chipbg:   '#3a8a50',
  white:    '#ffffff',
}

// ── Formatters ─────────────────────────────────────────────────────────────
function fmt(v) {
  if (v == null || isNaN(v)) return '—'
  return `UF ${Number(v).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtClp(uf, ufVal) {
  if (!uf || !ufVal) return null
  return `$${Math.round(Number(uf) * ufVal).toLocaleString('es-CL')}`
}
function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtVigencia(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  d.setDate(d.getDate() + 10)
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Styles ─────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: 'Geist',
    fontSize: 10,
    color: C.ink,
    backgroundColor: C.bg,
    flexDirection: 'column',
  },

  // ─── HEADER ───
  header: {
    backgroundColor: C.deep,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 44,
    paddingTop: 24,
    paddingBottom: 20,
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  ps:     { fontFamily: 'Geist', fontWeight: 800, fontSize: 22, color: C.gold },
  pipe:   { fontFamily: 'Geist', fontWeight: 300, fontSize: 22, color: C.dimgreen, marginHorizontal: 5 },
  phl:    { fontFamily: 'Geist', fontWeight: 800, fontSize: 22, color: C.gold },
  supply: { fontFamily: 'Geist', fontWeight: 800, fontSize: 22, color: C.white },
  tagline: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 7.5,
    color: C.dimgreen, letterSpacing: 1.6, textTransform: 'uppercase',
  },

  headerMeta: { alignItems: 'flex-end' },
  docLabel: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 8,
    color: C.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3,
  },
  docTitle: {
    fontFamily: 'Fraunces', fontWeight: 400, fontSize: 28,
    color: C.white, lineHeight: 1.1, marginBottom: 6,
  },
  docDate: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 11,
    color: '#90b0aa', marginBottom: 6,
  },
  ufBadge: {
    backgroundColor: C.mid, borderRadius: 3,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  ufBadgeText: { fontFamily: 'Geist', fontWeight: 400, fontSize: 9.5, color: C.white },

  // ─── GOLD RULE ───
  goldRule: { height: 2, backgroundColor: C.gold },

  // ─── BODY ───
  body: {
    flex: 1,
    paddingHorizontal: 44,
    paddingTop: 2,
    paddingBottom: 0,
    backgroundColor: C.bg,
    flexDirection: 'column',
  },
  section: { marginTop: 14 },

  // Section title
  secRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  secText: {
    fontFamily: 'Geist', fontWeight: 700, fontSize: 7.5,
    color: C.mid, letterSpacing: 2, textTransform: 'uppercase', marginRight: 10,
  },
  secLine: { flex: 1, height: 0.75, backgroundColor: C.rule },

  // ─── CLIENT ───
  clientCard: {
    borderLeftWidth: 2.5, borderLeftColor: C.mid,
    paddingLeft: 16, paddingVertical: 9,
    flexDirection: 'row',
  },
  clientField: { marginRight: 44 },
  fieldLabel: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 7.5,
    color: C.muted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4,
  },
  clientValue:   { fontFamily: 'Fraunces', fontWeight: 400, fontSize: 16, color: C.ink },
  clientValueSm: { fontFamily: 'Geist',     fontWeight: 400, fontSize: 13, color: C.ink },

  // ─── PRODUCT ───
  productTable: {
    borderWidth: 0.75, borderColor: C.rule,
    flexDirection: 'column',
  },
  productRow1: { flexDirection: 'row' },
  productRow2: {
    flexDirection: 'row',
    borderTopWidth: 0.75, borderTopColor: C.rule,
  },
  prodCell: {
    flex: 1,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRightWidth: 0.75, borderRightColor: C.rule,
    backgroundColor: C.bg,
  },
  prodCellLast: { borderRightWidth: 0 },
  prodCellWide: {
    flex: 1,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRightWidth: 0.75, borderRightColor: C.rule,
    backgroundColor: C.bg,
  },
  prodCellEmpty: { flex: 3, backgroundColor: '#eff5f3' },
  prodLabel: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 7,
    color: C.muted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 5,
  },
  prodVal: { fontFamily: 'Geist', fontWeight: 500, fontSize: 13, color: C.ink },
  badge: {
    backgroundColor: C.soft, borderRadius: 2,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: { fontFamily: 'Geist', fontWeight: 700, fontSize: 10, color: C.mid },

  // ─── FINANCING ───
  finRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.75, borderBottomColor: C.rule,
  },
  finRowHL: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 8,
    marginHorizontal: -8,
    backgroundColor: '#f5f2e6',
    borderBottomWidth: 0.75, borderBottomColor: C.rule,
  },
  finLabel:     { fontFamily: 'Geist', fontWeight: 400, fontSize: 11, color: C.muted },
  finLabelBold: { fontFamily: 'Geist', fontWeight: 700, fontSize: 11, color: C.ink },
  finRight: { alignItems: 'flex-end' },
  discRow: { flexDirection: 'row', alignItems: 'center' },
  chip: {
    backgroundColor: C.chipbg, borderRadius: 99,
    paddingHorizontal: 7, paddingVertical: 2,
    marginLeft: 8,
  },
  chipText: { fontFamily: 'Geist', fontWeight: 700, fontSize: 7.5, color: C.white },
  ufVal: {
    fontFamily: 'Fraunces', fontWeight: 400, fontSize: 18,
    color: C.ink, lineHeight: 1.1,
  },
  clpVal: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 9,
    color: C.muted, marginTop: 2, textAlign: 'right',
  },

  // ─── MONTHLY BOX ───
  monthBox: {
    flexDirection: 'row',
    borderWidth: 1.25, borderColor: C.mid,
    marginTop: 10,
  },
  monthLeft: {
    backgroundColor: C.deep,
    paddingHorizontal: 18, paddingVertical: 14,
    minWidth: 150,
    justifyContent: 'center',
  },
  monthSub: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 7,
    color: C.dimgreen, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 5,
  },
  monthBig: { fontFamily: 'Fraunces', fontWeight: 400, fontSize: 26, color: C.white, lineHeight: 1 },
  monthNote: { fontFamily: 'Geist', fontWeight: 400, fontSize: 9, color: C.dimgreen, marginTop: 4 },
  mstat: {
    flex: 1,
    paddingHorizontal: 16, paddingVertical: 14,
    borderLeftWidth: 0.75, borderLeftColor: C.rule,
    justifyContent: 'center',
  },
  mstatLabel: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 7,
    color: C.muted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5,
  },
  mstatVal: { fontFamily: 'Geist', fontWeight: 700, fontSize: 14, color: C.ink },
  mstatSub: { fontFamily: 'Geist', fontWeight: 400, fontSize: 9.5, color: C.muted, marginTop: 2 },

  // ─── NOTE ───
  nota: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 10,
    color: C.mid, backgroundColor: C.soft,
    borderLeftWidth: 2.5, borderLeftColor: C.rule,
    padding: 12, lineHeight: 1.5,
  },

  // ─── FOOTER ───
  footer: {
    borderTopWidth: 0.75, borderTopColor: C.rule,
    paddingHorizontal: 44, paddingTop: 14, paddingBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    backgroundColor: C.footerbg,
  },
  footerText: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 9,
    color: C.muted, marginBottom: 5,
  },
  disclaimer: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 7.5,
    color: C.muted, marginTop: 6, lineHeight: 1.4,
  },
  validBadge: {
    backgroundColor: C.amber_bg,
    borderWidth: 1, borderColor: C.amber_br,
    borderRadius: 3, paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  validDate: { fontFamily: 'Geist', fontWeight: 700, fontSize: 10, color: C.amber_tx },
  sigArea: { alignItems: 'center' },
  sigLine: { width: 160, height: 0.75, backgroundColor: C.ink, marginBottom: 5 },
  sigLabel: {
    fontFamily: 'Geist', fontWeight: 400, fontSize: 7.5,
    color: C.muted, letterSpacing: 1.2, textTransform: 'uppercase',
  },
})

// ── Sub-components ──────────────────────────────────────────────────────────
function SecTitle({ children }) {
  return (
    <View style={S.secRow}>
      <Text style={S.secText}>{children}</Text>
      <View style={S.secLine} />
    </View>
  )
}

function Signature() {
  return (
    <View style={S.sigArea}>
      <View style={S.sigLine} />
      <Text style={S.sigLabel}>Firma Ejecutivo / Sello</Text>
    </View>
  )
}

// ── Main document ───────────────────────────────────────────────────────────
export default function CotizacionPDF({ cot: c, ufValue }) {
  const clp = (uf) => ufValue && uf ? fmtClp(uf, ufValue) : null

  const hasSaldo     = c.saldoSepultura > 0
  const hasMonthly   = c.cuotaMensual != null
  const hasDescuento = c.descuento > 0
  const hasPie       = c.piePorc > 0

  // Product row cells
  const prodCells = [
    c.productoNombre && { label: 'Producto',       val: c.productoNombre, badge: false },
    c.parqueNombre   && { label: 'Parque',          val: c.parqueNombre,   badge: false },
    c.capacidad      && { label: 'Capacidad',       val: `${c.capacidad} personas`, badge: false },
    c.clasificacion  && { label: 'Clasificación',   val: `Clas. ${c.clasificacion}`, badge: true },
  ].filter(Boolean)

  return (
    <Document>

      {/* ═══════════════════════════ PAGE 1 ═══════════════════════════════ */}
      <Page size="A4" style={S.page}>

        {/* ── HEADER ── */}
        <View style={S.header}>
          {/* Brand (izquierda) */}
          <View>
            <View style={S.brandLogoRow}>
              <Text style={S.ps}>PS</Text>
              <Text style={S.pipe}> | </Text>
              <Text style={S.phl}>PHL</Text>
              <Text style={S.supply}>SUPPLY</Text>
            </View>
            <Text style={S.tagline}>Cotización de Servicios</Text>
          </View>

          {/* Meta (derecha) */}
          <View style={S.headerMeta}>
            <Text style={S.docLabel}>Documento oficial</Text>
            <Text style={S.docTitle}>Cotización de Servicios</Text>
            <Text style={S.docDate}>{fmtDate(c.fecha)}</Text>
            {ufValue && (
              <View style={S.ufBadge}>
                <Text style={S.ufBadgeText}>
                  {'UF del día: $'}
                  {ufValue.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Gold separator */}
        <View style={S.goldRule} />

        {/* ── BODY ── */}
        <View style={S.body}>

          {/* CLIENTE */}
          {(c.nombre || c.rut) && (
            <View style={S.section}>
              <SecTitle>Cliente</SecTitle>
              <View style={S.clientCard}>
                {c.nombre && (
                  <View style={S.clientField}>
                    <Text style={S.fieldLabel}>Nombre completo</Text>
                    <Text style={S.clientValue}>{c.nombre}</Text>
                  </View>
                )}
                {c.rut && (
                  <View style={S.clientField}>
                    <Text style={S.fieldLabel}>RUT</Text>
                    <Text style={S.clientValueSm}>{c.rut}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* PRODUCTO */}
          {prodCells.length > 0 && (
            <View style={S.section}>
              <SecTitle>Producto</SecTitle>
              <View style={S.productTable}>
                {/* Row 1 */}
                <View style={S.productRow1}>
                  {prodCells.map((cell, i) => (
                    <View key={cell.label}
                      style={[S.prodCell, i === prodCells.length - 1 && S.prodCellLast]}>
                      <Text style={S.prodLabel}>{cell.label}</Text>
                      {cell.badge
                        ? <View style={S.badge}><Text style={S.badgeText}>{cell.val}</Text></View>
                        : <Text style={S.prodVal}>{cell.val}</Text>
                      }
                    </View>
                  ))}
                </View>
                {/* Row 2: N° Sepulturas */}
                {c.numSepulturas && (
                  <View style={S.productRow2}>
                    <View style={S.prodCellWide}>
                      <Text style={S.prodLabel}>N° de Sepulturas</Text>
                      <Text style={S.prodVal}>{c.numSepulturas}</Text>
                    </View>
                    <View style={S.prodCellEmpty} />
                  </View>
                )}
              </View>
            </View>
          )}

          {/* FINANCIAMIENTO */}
          <View style={S.section}>
            <SecTitle>Financiamiento</SecTitle>

            {/* Valor de lista */}
            <View style={S.finRow}>
              <Text style={S.finLabel}>Valor de lista</Text>
              <View style={S.finRight}>
                <Text style={S.ufVal}>{fmt(c.valorSepultura)}</Text>
              </View>
            </View>

            {/* Descuento */}
            {hasDescuento && (
              <View style={S.finRow}>
                <View style={S.discRow}>
                  <Text style={S.finLabel}>Descuento</Text>
                  <View style={S.chip}>
                    <Text style={S.chipText}>−{c.descuento}%</Text>
                  </View>
                </View>
                <View style={S.finRight}>
                  <Text style={S.ufVal}>
                    {c.valorSepultura && c.valorConDescuento
                      ? `− ${fmt(c.valorSepultura - c.valorConDescuento)}`
                      : '—'}
                  </Text>
                </View>
              </View>
            )}

            {/* Valor con descuento (highlight) */}
            <View style={S.finRowHL}>
              <Text style={S.finLabelBold}>Valor con descuento</Text>
              <View style={S.finRight}>
                <Text style={S.ufVal}>{fmt(c.valorConDescuento)}</Text>
                {clp(c.valorConDescuento) && (
                  <Text style={S.clpVal}>{clp(c.valorConDescuento)}</Text>
                )}
              </View>
            </View>

            {/* Pie */}
            {hasPie && (
              <View style={S.finRow}>
                <Text style={S.finLabel}>Pie ({c.piePorc}%)</Text>
                <View style={S.finRight}>
                  <Text style={S.ufVal}>{fmt(c.pieUF)}</Text>
                  {clp(c.pieUF) && <Text style={S.clpVal}>{clp(c.pieUF)}</Text>}
                </View>
              </View>
            )}

            {/* Saldo financiado (sin borde inferior) */}
            {hasSaldo && (
              <View style={[S.finRow, { borderBottomWidth: 0 }]}>
                <Text style={S.finLabel}>Saldo financiado</Text>
                <View style={S.finRight}>
                  <Text style={S.ufVal}>{fmt(c.saldoSepultura)}</Text>
                </View>
              </View>
            )}

            {/* Cuota mensual box */}
            {hasMonthly && (
              <View style={S.monthBox}>
                {/* Izquierda: cuota */}
                <View style={S.monthLeft}>
                  <Text style={S.monthSub}>Cuota mensual</Text>
                  <Text style={S.monthBig}>{fmt(c.cuotaMensual)}</Text>
                  {ufValue && c.cuotaMensual && (
                    <Text style={S.monthNote}>{fmtClp(c.cuotaMensual, ufValue)} / mes</Text>
                  )}
                </View>

                {/* Plazo */}
                {c.cuotas && (
                  <View style={S.mstat}>
                    <Text style={S.mstatLabel}>Plazo</Text>
                    <Text style={S.mstatVal}>{c.cuotas} meses</Text>
                    {c.cuotas >= 12 && (
                      <Text style={S.mstatSub}>
                        {(c.cuotas / 12).toFixed(1).replace('.0', '')} años
                      </Text>
                    )}
                  </View>
                )}

                {/* Carencia (opcional) */}
                {c.carencia > 0 && (
                  <View style={S.mstat}>
                    <Text style={S.mstatLabel}>Carencia</Text>
                    <Text style={S.mstatVal}>{c.carencia} meses</Text>
                  </View>
                )}

                {/* Comisión */}
                {c.comision && (
                  <View style={S.mstat}>
                    <Text style={S.mstatLabel}>Comisión</Text>
                    <Text style={S.mstatVal}>{fmt(c.comision.uf)}</Text>
                    <Text style={S.mstatSub}>{c.comision.porcentaje}% sobre precio</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* NOTAS */}
          {c.nota && (
            <View style={S.section}>
              <SecTitle>Notas</SecTitle>
              <Text style={S.nota}>{c.nota}</Text>
            </View>
          )}

        </View>

        {/* ── FOOTER ── */}
        <View style={S.footer}>
          <View>
            <Text style={S.footerText}>Esta cotización es válida hasta el</Text>
            <View style={S.validBadge}>
              <Text style={S.validDate}>{fmtVigencia(c.fecha)}</Text>
            </View>
            <Text style={S.disclaimer}>
              Los valores en UF se actualizan diariamente según el indicador oficial del CMF.
            </Text>
          </View>
          <Signature />
        </View>

      </Page>

    </Document>
  )
}
