import { useState, useEffect } from 'react'
import { getCotizaciones, deleteCotizacion } from './storage'
import './ClientesView.css'

function formatUF(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `UF ${Number(value).toLocaleString('es-CL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Agrupa cotizaciones por cliente (RUT si tiene, sino nombre)
function agruparClientes(cotizaciones) {
  const mapa = new Map()
  for (const c of cotizaciones) {
    const key = c.rut?.trim() || c.nombre?.trim() || '__sin_id__'
    if (!mapa.has(key)) {
      mapa.set(key, {
        key,
        nombre: c.nombre || '',
        primerNombre: c.primerNombre || '',
        segundoNombre: c.segundoNombre || '',
        apellidoPaterno: c.apellidoPaterno || '',
        apellidoMaterno: c.apellidoMaterno || '',
        rut: c.rut || '',
        cotizaciones: [],
      })
    }
    mapa.get(key).cotizaciones.push(c)
  }
  return Array.from(mapa.values()).sort((a, b) => {
    const fa = a.cotizaciones[0]?.fecha || ''
    const fb = b.cotizaciones[0]?.fecha || ''
    return fb.localeCompare(fa)
  })
}

export default function ClientesView({ onCotizacionDeleted }) {
  const [cotizaciones, setCotizaciones] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    getCotizaciones().then(setCotizaciones).catch(console.error)
  }, [])

  const todos = agruparClientes(cotizaciones)
  const q = busqueda.trim().toLowerCase()
  const clientes = q
    ? todos.filter(c =>
        (c.nombre || '').toLowerCase().includes(q) ||
        (c.rut || '').toLowerCase().includes(q)
      )
    : todos

  async function handleEliminar(id) {
    await deleteCotizacion(id).catch(console.error)
    const nuevas = cotizaciones.filter(c => c.id !== id)
    setCotizaciones(nuevas)
    onCotizacionDeleted?.()
    if (clienteSeleccionado) {
      const updated = { ...clienteSeleccionado, cotizaciones: clienteSeleccionado.cotizaciones.filter(c => c.id !== id) }
      if (updated.cotizaciones.length === 0) setClienteSeleccionado(null)
      else setClienteSeleccionado(updated)
    }
  }

  if (clienteSeleccionado) {
    return (
      <main className="clientes-main">
        <ClienteDetalle
          cliente={clienteSeleccionado}
          onBack={() => setClienteSeleccionado(null)}
          onEliminar={handleEliminar}
        />
      </main>
    )
  }

  return (
    <main className="clientes-main">
      <div className="clientes-header">
        <h2>Mis Clientes</h2>
        <span className="clientes-count">{todos.length} {todos.length === 1 ? 'cliente' : 'clientes'}</span>
      </div>
      <input
        className="search-input clientes-search"
        type="text"
        placeholder="Buscar por nombre o RUT…"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      {clientes.length === 0 ? (
        <div className="clientes-empty">{q ? 'Sin resultados.' : 'No hay cotizaciones guardadas aún.'}</div>
      ) : (
        <div className="clientes-grid">
          {clientes.map(cliente => {
            const ultima = cliente.cotizaciones[0]
            const totalValor = cliente.cotizaciones.reduce((s, c) => s + (c.valorConDescuento || 0), 0)
            return (
              <button key={cliente.key} className="cliente-card" onClick={() => setClienteSeleccionado(cliente)}>
                <div className="cliente-card-top">
                  <div className="cliente-nombre">{cliente.nombre || <em>Sin nombre</em>}</div>
                  {cliente.rut && <div className="cliente-rut">{cliente.rut}</div>}
                </div>
                <div className="cliente-card-stats">
                  <div className="cliente-stat">
                    <span>Cotizaciones</span>
                    <strong>{cliente.cotizaciones.length}</strong>
                  </div>
                  <div className="cliente-stat">
                    <span>Valor total</span>
                    <strong>{formatUF(totalValor)}</strong>
                  </div>
                  <div className="cliente-stat">
                    <span>Último producto</span>
                    <strong>{ultima?.productoNombre || '—'}</strong>
                  </div>
                  <div className="cliente-stat">
                    <span>Última cotización</span>
                    <strong>{ultima?.fecha ? formatDate(ultima.fecha) : '—'}</strong>
                  </div>
                </div>
                <div className="cliente-card-arrow">→</div>
              </button>
            )
          })}
        </div>
      )}
    </main>
  )
}

function ClienteDetalle({ cliente, onBack, onEliminar }) {
  return (
    <div className="detalle-cliente">
      <div className="detalle-topbar">
        <button className="btn-back" onClick={onBack}>← Volver</button>
      </div>

      <div className="detalle-cliente-header">
        <div>
          <h2>{cliente.nombre || <em>Sin nombre</em>}</h2>
          <div className="detalle-nombre-desglose">
            {cliente.primerNombre && <span><small>1° nombre</small>{cliente.primerNombre}</span>}
            {cliente.segundoNombre && <span><small>2° nombre</small>{cliente.segundoNombre}</span>}
            {cliente.apellidoPaterno && <span><small>Paterno</small>{cliente.apellidoPaterno}</span>}
            {cliente.apellidoMaterno && <span><small>Materno</small>{cliente.apellidoMaterno}</span>}
          </div>
          {cliente.rut && <span className="detalle-rut">{cliente.rut}</span>}
        </div>
        <span className="detalle-badge">{cliente.cotizaciones.length} {cliente.cotizaciones.length === 1 ? 'cotización' : 'cotizaciones'}</span>
      </div>

      <div className="cotizaciones-lista">
        {cliente.cotizaciones.map(c => (
          <CotizacionCard key={c.id} cotizacion={c} onEliminar={onEliminar} />
        ))}
      </div>
    </div>
  )
}

function CotizacionCard({ cotizacion: c, onEliminar }) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className="cotizacion-card">
      <div className="cotizacion-card-header" onClick={() => setExpandido(e => !e)}>
        <div className="cotizacion-card-left">
          <span className="cotizacion-producto">{c.productoNombre || '—'}</span>
          <div className="cotizacion-meta">
            {c.parqueNombre && <span>{c.parqueNombre}</span>}
            {c.capacidad && <span>{c.capacidad} cap.</span>}
            <span>{formatDate(c.fecha)}</span>
          </div>
        </div>
        <div className="cotizacion-card-right">
          <span className="cotizacion-valor">{formatUF(c.valorConDescuento)}</span>
          <span className="cotizacion-toggle">{expandido ? '▲' : '▼'}</span>
        </div>
      </div>

      {expandido && (
        <div className="cotizacion-detalle">
          <div className="detalle-grid">

            {/* Producto */}
            <div className="detalle-seccion">
              <h4>Producto</h4>
              <table className="detalle-tabla">
                <tbody>
                  {c.productoNombre   && <tr><td>Producto</td><td>{c.productoNombre}</td></tr>}
                  {c.parqueNombre     && <tr><td>Parque</td><td>{c.parqueNombre}</td></tr>}
                  {c.capacidad        && <tr><td>Capacidad</td><td>{c.capacidad}</td></tr>}
                  {c.clasificacion    && <tr><td>Clasificación</td><td>Clas. {c.clasificacion}</td></tr>}
                  {c.numSepulturas > 1 && <tr><td>N° sepulturas</td><td>{c.numSepulturas}</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Financiamiento */}
            <div className="detalle-seccion">
              <h4>Financiamiento</h4>
              <table className="detalle-tabla">
                <tbody>
                  <tr><td>Valor</td><td>{formatUF(c.valorSepultura)}</td></tr>
                  {c.descuento > 0   && <tr><td>Descuento</td><td>{c.descuento}%</td></tr>}
                  <tr><td>Valor c/desc.</td><td><strong>{formatUF(c.valorConDescuento)}</strong></td></tr>
                  {c.piePorc > 0     && <tr><td>Pie</td><td>{c.piePorc}% · {formatUF(c.pieUF)}</td></tr>}
                  {c.saldoSepultura  && <tr><td>Saldo financiado</td><td>{formatUF(c.saldoSepultura)}</td></tr>}
                  {c.cuotas          && <tr><td>Cuotas</td><td>{c.cuotas} meses{c.carencia ? ` + ${c.carencia}m carencia` : ''}</td></tr>}
                  {c.cuotaMensual !== null && c.cuotaMensual !== undefined &&
                    <tr><td>Cuota mensual</td><td><strong>{formatUF(c.cuotaMensual)}</strong></td></tr>}
                </tbody>
              </table>
            </div>

            {/* Comisión */}
            {c.comision && (
              <div className="detalle-seccion">
                <h4>Comisión</h4>
                <table className="detalle-tabla">
                  <tbody>
                    <tr><td>Comisión</td><td><strong>{c.comision.porcentaje}% · {formatUF(c.comision.uf)}</strong></td></tr>
                    {c.comision.activacionFNP && (
                      <tr><td>Activación FNP</td><td>{c.comision.activacionFNP.porcentaje}% · {formatUF(c.comision.activacionFNP.uf)}</td></tr>
                    )}
                    {c.comision.premios?.map(p => (
                      <tr key={p.cuota}><td>Premio cuota {p.cuota}</td><td>{p.porc}% · {formatUF(p.uf)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="cotizacion-actions">
            <button className="btn-eliminar-cot" onClick={() => onEliminar(c.id)}>Eliminar cotización</button>
          </div>
        </div>
      )}
    </div>
  )
}
