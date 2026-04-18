import './PrintView.css'

function fmt(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `UF ${Number(value).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtClp(uf, ufValue) {
  if (!uf || !ufValue) return null
  return `$${Math.round(Number(uf) * ufValue).toLocaleString('es-CL')}`
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtVigencia(iso) {
  const d = new Date(iso)
  d.setDate(d.getDate() + 10)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function PrintView({ cot: c, ufValue }) {
  const productCells = [
    c.productoNombre && { label: 'Producto', value: c.productoNombre, badge: false },
    c.parqueNombre   && { label: 'Parque',   value: c.parqueNombre,   badge: false },
    c.capacidad      && { label: 'Capacidad', value: c.capacidad,     badge: false },
    c.clasificacion  && { label: 'Clasificación', value: `Clas. ${c.clasificacion}`, badge: true },
  ].filter(Boolean)

  return (
    <div className="print-overlay">
      <div className="pv-page">

        {/* ── HEADER ── */}
        <div className="pv-header">
          <div className="pv-brand">
            <div className="pv-ps">PS</div>
            <div className="pv-brand-name">Nuestros Parques</div>
            <div className="pv-brand-tagline">Cotización de Servicios</div>
          </div>
          <div className="pv-header-meta">
            <div className="pv-doc-label">Cotización</div>
            <div className="pv-doc-title">Cotización de Servicios</div>
            <div className="pv-doc-date">{fmtDate(c.fecha)}</div>
            {ufValue && (
              <div className="pv-uf-badge">
                UF del día: ${ufValue.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>
        </div>
        <div style={{ height: '1px', background: 'oklch(86% 0.012 193)', margin: '0 52px' }} />

        {/* ── BODY ── */}
        <div className="pv-body">

          {/* Cliente */}
          {(c.nombre || c.rut) && (
            <div>
              <div className="pv-section-title">Cliente</div>
              <div className="pv-client-card">
                {c.nombre && (
                  <div className="pv-client-field">
                    <label>Nombre completo</label>
                    <div className="pv-client-value">{c.nombre}</div>
                  </div>
                )}
                {c.rut && (
                  <div className="pv-client-field">
                    <label>RUT</label>
                    <div className="pv-client-value pv-client-value-sm">{c.rut}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Producto */}
          {productCells.length > 0 && (
            <div>
              <div className="pv-section-title">Producto</div>
              <div className="pv-product-grid" style={{ gridTemplateColumns: `repeat(${Math.min(productCells.length, 4)}, 1fr)` }}>
                {productCells.map(cell => (
                  <div key={cell.label} className="pv-product-cell">
                    <label>{cell.label}</label>
                    {cell.badge
                      ? <span className="pv-badge">{cell.value}</span>
                      : <div className="pv-val">{cell.value}</div>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financiamiento */}
          <div>
            <div className="pv-section-title">Financiamiento</div>
            <div className="pv-fin-rows">
              <div className="pv-fin-row">
                <span className="pv-fin-label">Valor de lista</span>
                <div className="pv-fin-amounts">
                  <span className="pv-uf-val">{fmt(c.valorSepultura)}</span>
                  {ufValue && c.valorSepultura && <span className="pv-clp-val">{fmtClp(c.valorSepultura, ufValue)}</span>}
                </div>
              </div>

              {c.descuento > 0 && (
                <div className="pv-fin-row">
                  <span className="pv-fin-label">
                    Descuento <span className="pv-discount-chip">−{c.descuento}%</span>
                  </span>
                  <div className="pv-fin-amounts">
                    <span className="pv-uf-val">
                      {c.valorSepultura && c.valorConDescuento
                        ? `−${fmt(c.valorSepultura - c.valorConDescuento)}`
                        : '—'}
                    </span>
                  </div>
                </div>
              )}

              <div className="pv-fin-row pv-fin-highlight">
                <span className="pv-fin-label">Valor con descuento</span>
                <div className="pv-fin-amounts">
                  <span className="pv-uf-val pv-uf-val-lg">{fmt(c.valorConDescuento)}</span>
                  {ufValue && c.valorConDescuento && <span className="pv-clp-val">{fmtClp(c.valorConDescuento, ufValue)}</span>}
                </div>
              </div>

              {c.piePorc > 0 && (
                <div className="pv-fin-row">
                  <span className="pv-fin-label">Pie ({c.piePorc}%)</span>
                  <div className="pv-fin-amounts">
                    <span className="pv-uf-val">{fmt(c.pieUF)}</span>
                    {ufValue && c.pieUF && <span className="pv-clp-val">{fmtClp(c.pieUF, ufValue)}</span>}
                  </div>
                </div>
              )}

              {c.saldoSepultura > 0 && (
                <div className="pv-fin-row">
                  <span className="pv-fin-label">Saldo financiado</span>
                  <div className="pv-fin-amounts">
                    <span className="pv-uf-val">{fmt(c.saldoSepultura)}</span>
                    {ufValue && c.saldoSepultura && <span className="pv-clp-val">{fmtClp(c.saldoSepultura, ufValue)}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Cuota mensual */}
            {c.cuotaMensual != null && (
              <div className="pv-monthly-box">
                <div className="pv-monthly-left">
                  <div className="pv-monthly-sub">Cuota mensual</div>
                  <div className="pv-monthly-big">{fmt(c.cuotaMensual)}</div>
                  {ufValue && c.cuotaMensual && (
                    <div className="pv-monthly-note">{fmtClp(c.cuotaMensual, ufValue)} / mes</div>
                  )}
                </div>
                <div className="pv-monthly-right">
                  {c.cuotas && (
                    <div className="pv-mstat">
                      <label>Plazo</label>
                      <div className="pv-sv">{c.cuotas} meses</div>
                      {c.cuotas >= 12 && (
                        <div className="pv-ss">{(c.cuotas / 12).toFixed(1).replace('.0', '')} años</div>
                      )}
                    </div>
                  )}
                  {c.carencia > 0 && (
                    <div className="pv-mstat">
                      <label>Carencia</label>
                      <div className="pv-sv">{c.carencia} meses</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          {c.nota && (
            <div>
              <div className="pv-section-title">Notas</div>
              <p className="pv-nota">{c.nota}</p>
            </div>
          )}

        </div>

        {/* ── FOOTER ── */}
        <div className="pv-footer">
          <div className="pv-validity">
            Esta cotización es válida hasta el<br />
            <span className="pv-validity-date">{fmtVigencia(c.fecha)}</span>
            <br /><br />
            Los valores en UF se actualizan diariamente según el indicador oficial del CMF.
          </div>
          <div className="pv-signature">
            <div className="pv-signature-line" />
            <div className="pv-signature-label">Firma del Asesor</div>
          </div>
        </div>

      </div>
    </div>
  )
}
