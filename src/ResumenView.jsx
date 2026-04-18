import './ResumenView.css'

const ESTADOS = [
  { key: 'pendiente', label: 'Pendiente', color: 'var(--ink-4)' },
  { key: 'enviada',   label: 'Enviada',   color: '#2563eb' },
  { key: 'cerrada',   label: 'Cerrada',   color: 'var(--success)' },
  { key: 'perdida',   label: 'Perdida',   color: 'var(--danger)' },
]

function fmt(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `UF ${Number(value).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtClp(uf, ufValue) {
  if (!uf || !ufValue) return null
  const clp = Math.round(Number(uf) * ufValue)
  return `$${clp.toLocaleString('es-CL')}`
}

function getMes(iso) {
  return iso?.slice(0, 7) // 'YYYY-MM'
}

export default function ResumenView({ cotizaciones, ufValue }) {
  const hoy = new Date()
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`

  const delMes = cotizaciones.filter(c => getMes(c.fecha) === mesActual)
  const totalMes = delMes.reduce((s, c) => s + (c.valorConDescuento || 0), 0)
  const comisionMes = delMes.reduce((s, c) => s + (c.comision?.uf || 0), 0)

  // Conteo por estado (total histórico)
  const porEstado = ESTADOS.map(e => ({
    ...e,
    count: cotizaciones.filter(c => (c.estado || 'pendiente') === e.key).length,
  }))
  const maxEstado = Math.max(...porEstado.map(e => e.count), 1)

  // Tasa de cierre (cerradas / (cerradas + perdidas))
  const cerradas = cotizaciones.filter(c => c.estado === 'cerrada').length
  const perdidas = cotizaciones.filter(c => c.estado === 'perdida').length
  const tasaBase = cerradas + perdidas
  const tasaCierre = tasaBase > 0 ? Math.round((cerradas / tasaBase) * 100) : null

  // Top productos
  const prodCount = {}
  for (const c of cotizaciones) {
    if (c.productoNombre) prodCount[c.productoNombre] = (prodCount[c.productoNombre] || 0) + 1
  }
  const topProductos = Object.entries(prodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxProd = topProductos[0]?.[1] || 1

  // Cotizaciones por mes (últimos 6 meses)
  const meses = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es-CL', { month: 'short' })
    const count = cotizaciones.filter(c => getMes(c.fecha) === key).length
    const valor = cotizaciones.filter(c => getMes(c.fecha) === key).reduce((s, c) => s + (c.valorConDescuento || 0), 0)
    meses.push({ key, label, count, valor })
  }
  const maxMes = Math.max(...meses.map(m => m.count), 1)

  return (
    <main className="resumen-main">
      <div className="resumen-header">
        <h2>Resumen</h2>
        <span className="resumen-mes-label">{new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</span>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Cotizaciones este mes</span>
          <span className="kpi-value">{delMes.length}</span>
          <span className="kpi-sub">de {cotizaciones.length} en total</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total cotizado este mes</span>
          <span className="kpi-value kpi-uf">{fmt(totalMes)}</span>
          {ufValue && totalMes > 0 && <span className="kpi-sub">{fmtClp(totalMes, ufValue)}</span>}
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Comisión proyectada mes</span>
          <span className="kpi-value kpi-green">{fmt(comisionMes)}</span>
          {ufValue && comisionMes > 0 && <span className="kpi-sub">{fmtClp(comisionMes, ufValue)}</span>}
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Tasa de cierre</span>
          <span className="kpi-value kpi-blue">
            {tasaCierre !== null ? `${tasaCierre}%` : '—'}
          </span>
          <span className="kpi-sub">{cerradas} cerradas · {perdidas} perdidas</span>
        </div>
      </div>

      <div className="resumen-cols">
        {/* Cotizaciones por mes */}
        <div className="resumen-card">
          <h3>Actividad mensual</h3>
          <div className="bar-chart">
            {meses.map(m => (
              <div key={m.key} className="bar-col">
                <div className="bar-track">
                  <div
                    className={`bar-fill${m.key === mesActual ? ' bar-fill-active' : ''}`}
                    style={{ height: `${Math.round((m.count / maxMes) * 100)}%` }}
                  />
                </div>
                <span className="bar-count">{m.count}</span>
                <span className="bar-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estado de cotizaciones */}
        <div className="resumen-card">
          <h3>Estado de cotizaciones</h3>
          <div className="estado-bars">
            {porEstado.map(e => (
              <div key={e.key} className="estado-bar-row">
                <span className="estado-bar-label">{e.label}</span>
                <div className="estado-bar-track">
                  <div
                    className="estado-bar-fill"
                    style={{
                      width: `${Math.round((e.count / maxEstado) * 100)}%`,
                      background: e.color,
                    }}
                  />
                </div>
                <span className="estado-bar-count">{e.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top productos */}
      {topProductos.length > 0 && (
        <div className="resumen-card">
          <h3>Productos más cotizados</h3>
          <div className="estado-bars">
            {topProductos.map(([nombre, count]) => (
              <div key={nombre} className="estado-bar-row">
                <span className="estado-bar-label prod-label">{nombre}</span>
                <div className="estado-bar-track">
                  <div
                    className="estado-bar-fill"
                    style={{ width: `${Math.round((count / maxProd) * 100)}%`, background: 'var(--accent)' }}
                  />
                </div>
                <span className="estado-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {cotizaciones.length === 0 && (
        <div className="resumen-empty">Guarda cotizaciones para ver estadísticas.</div>
      )}
    </main>
  )
}
