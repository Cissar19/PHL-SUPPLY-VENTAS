import { useState, useEffect } from 'react'
import { PRODUCTOS, PARQUES, PLANES_NF } from './catalog'
import { getOverride, saveOverride, resetOverride } from './planStorage'
import './PlansView.css'

const FAMILIAS = ['Sepultura', 'Complementario', 'Mausoleo', 'Funeraria']

const BENEFICIOS_POR_PRODUCTO = {
  'sepultura-tradicional':           ['Plan de cesantía', 'Servicio de condolencias estándar', 'Plan de aporte funerario', '1° Uso templo velatorio (según % de pie)'],
  'sepultura-integra':               ['1° Sepultación gratis', '1° Mantención gratis'],
  'sepultura-integra-premium':       ['Derecho de sepultación (según capacidades)', '1° Mantención gratis'],
  'sepultura-sb':                    [],
  'sepultura-premium-los-olivos':    ['Plan de cesantía', 'Servicio de condolencias estándar', 'Plan de aporte funerario'],
  'aumento-de-capacidad':            [],
  'liberador-de-mantencion':         [],
  'mausoleos-premium':               ['Plan de cesantía', 'Servicio de condolencias estándar', 'Plan de aporte funerario'],
  'servicio-funerario-tradicional':  ['Cobertura de precio con Cuota Mortuoria', 'Coordinación trámite de sepultación en Red de Cementerios GNP'],
  'servicio-funerario-esencial':     ['Cobertura de valor del servicio con Cuota Mortuoria'],
  'servicio-funerario-nf':           ['No tiene restricción de parentesco — es no nominativo'],
  'cineracion-linea-inicial':        ['Trámite ante SEREMI de Salud', 'Ánfora de madera lenga natural', 'Servicio de condolencia estándar', 'Uso del templo de Parque Manantial'],
  'cineracion-nf':                   ['Trámite ante SEREMI de Salud', 'Ánfora de madera lenga natural', 'Servicio de condolencia estándar', 'Uso del templo de Parque Manantial'],
  'cineracion-linea-homenaje':       ['Trámite ante SEREMI de Salud', 'Ánfora de Línea Homenaje', 'Servicio de condolencia estándar', 'Uso del templo de Parque Manantial'],
  'cineracion-linea-gran-homenaje':  ['Trámite ante SEREMI de Salud', 'Ánfora de Línea Gran Homenaje', 'Servicio de condolencia estándar', 'Servicio Religioso', 'Uso del templo de Parque Manantial', 'Dúo musical para ceremonia de recepción'],
  'columbario-jardin-cenizas':       ['Liberador de Mantención 3 Años', 'Primera apertura sin costo (a partir de la segunda 3 UF + IVA)', 'Servicio de condolencia estándar'],
  'columbario-construido':           ['Liberador de Mantención 3 Años', 'Primera apertura sin costo (a partir de la segunda 3 UF + IVA)', 'Servicio de condolencia estándar'],
  'columbario-plus':                 ['Liberador de Mantención 3 Años', 'Primera apertura sin costo (a partir de la segunda 3 UF + IVA)', 'Servicio de condolencia estándar', '10% descuento en SS.FF. en Nuestros Parques'],
}

const DOCUMENTOS_POR_PRODUCTO = {
  'sepultura-tradicional':           ['Estipulaciones Generales', 'Estipulaciones Específicas', 'Anexo 1 Beneficios Complementarios', 'Anexo 2 – Servicio SAC', 'Seguro de Desgravamen', 'DPS (si aplica)'],
  'sepultura-integra':               ['Estipulaciones Generales', 'Estipulaciones Específicas', 'Seguro de Desgravamen', 'DPS (si aplica)'],
  'sepultura-integra-premium':       ['Estipulaciones Generales', 'Estipulaciones Específicas', 'Seguro de Desgravamen', 'DPS (si aplica)'],
  'sepultura-sb':                    ['Formulario "Modificación de Contrato" (sin beneficios complementarios)'],
  'sepultura-premium-los-olivos':    ['Estipulaciones Generales', 'Estipulaciones Específicas', 'Anexo 1 Beneficios Complementarios', 'Anexo 2 – Servicio SAC', 'Seguro de Desgravamen', 'DPS (si aplica)'],
  'aumento-de-capacidad':            ['Contrato Anexo Aumento de Capacidad'],
  'liberador-de-mantencion':         ['Contrato Anexo Liberador de Mantención'],
  'mausoleos-premium':               ['Estipulaciones Generales', 'Estipulaciones Específicas', 'Anexo 1 Beneficios Complementarios', 'Anexo 2 – Servicio SAC', 'Seguro de Desgravamen', 'DPS (si aplica)'],
  'servicio-funerario-tradicional':  ['Orden de venta por SS.FF.', 'Orden de Servicio', 'Carnet de Identidad del Contratante', 'Carnet de Identidad Fallecido', 'Certificado Médico de Defunción', 'Documentación asociada a Cuota Mortuoria (si aplica)'],
  'servicio-funerario-esencial':     ['Orden de venta por SS.FF.', 'Orden de Servicio', 'Carnet de Identidad del Contratante', 'Carnet de Identidad Fallecido', 'Certificado Médico de Defunción', 'Documentación asociada a Cuota Mortuoria (si aplica)', 'Documentación de contrato Servicio Cineración NI'],
  'servicio-funerario-nf':           ['Contrato Prestación de Servicios Funerarios NF', 'Anexo 1 Detalle de planes de servicios funerarios', 'Anexo 2 Seguro Desgravamen', 'Anexo 3 SAC', 'Documentación de identidad cliente, DICOM y acreditación de renta'],
  'cineracion-linea-inicial':        ['Contrato Cineración NI', 'Anexo 1 Detalle Productos Cineración', 'Anexo 2 Documentación Requerida Cineración', 'Carnet de Identidad del Titular', 'Carnet de Identidad Fallecido', 'Certificado Médico de Defunción', 'Declaración Única de Cineración', 'Documentación solicitud de Cineración ante SEREMI de Salud'],
  'cineracion-nf':                   ['Contrato Cineración NF', 'Anexo 1 Detalle Productos Cineración', 'Anexo 2 Documentación Requerida Cineración', 'Seguro de Desgravamen', 'DPS (si aplica)', 'Carnet de Identidad del Titular'],
  'cineracion-linea-homenaje':       ['Contrato Cineración NI', 'Anexo 1 Detalle Productos Cineración', 'Anexo 2 Documentación Requerida Cineración', 'Carnet de Identidad del Titular', 'Carnet de Identidad Fallecido', 'Certificado Médico de Defunción', 'Declaración Única de Cineración', 'Documentación solicitud de Cineración ante SEREMI de Salud'],
  'cineracion-linea-gran-homenaje':  ['Contrato Cineración NI', 'Anexo 1 Detalle Productos Cineración', 'Anexo 2 Documentación Requerida Cineración', 'Carnet de Identidad del Titular', 'Carnet de Identidad Fallecido', 'Certificado Médico de Defunción', 'Declaración Única de Cineración', 'Documentación solicitud de Cineración ante SEREMI de Salud'],
  'columbario-jardin-cenizas':       ['Estipulaciones Generales Columbarios', 'Estipulaciones Específicas Columbarios', 'Anexo 1 – Servicio SAC', 'Seguro de Desgravamen', 'DPS (si aplica)'],
  'columbario-construido':           ['Estipulaciones Generales Columbarios', 'Estipulaciones Específicas Columbarios', 'Anexo 1 – Servicio SAC', 'Seguro de Desgravamen', 'DPS (si aplica)'],
  'columbario-plus':                 ['Estipulaciones Generales Columbarios', 'Estipulaciones Específicas Columbarios', 'Anexo 1 – Servicio SAC', 'Anexo 2 – Beneficios', 'Seguro de Desgravamen', 'DPS (si aplica)'],
}

function formatUF(v) {
  if (v === null || v === undefined || isNaN(v)) return '—'
  return `UF ${Number(v).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtUFShort(v) {
  return `UF ${Number(v).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`
}

function getPriceRange(producto) {
  const prices = []
  for (const parque of PARQUES) {
    for (const cap of producto.capacidades) {
      const p = producto.getPrecio(parque.slug, cap)
      if (p !== null && p !== undefined) prices.push(p)
    }
  }
  if (prices.length === 0) return null
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export default function PlansView() {
  const [selected, setSelected] = useState(null)

  return (
    <main className="plans-main">
      {selected ? (
        <PlanDetail slug={selected} onBack={() => setSelected(null)} />
      ) : (
        <PlanList onSelect={setSelected} />
      )}
    </main>
  )
}

function PlanList({ onSelect }) {
  return (
    <div className="plan-list">
      {FAMILIAS.map(fam => (
        <div key={fam} className="plan-familia">
          <h2 className="familia-title">{fam}</h2>
          <div className="plan-grid">
            {PRODUCTOS.filter(p => p.familia === fam).map(p => {
              const range = getPriceRange(p)
              const beneficiosCount = (BENEFICIOS_POR_PRODUCTO[p.slug] || []).length
              const capLabel = p.capacidades.length > 1
                ? `${p.capacidades[0]}–${p.capacidades[p.capacidades.length - 1]} ${p.labelCapacidad.toLowerCase()}`
                : `${p.capacidades[0]} ${p.labelCapacidad.toLowerCase()}`
              return (
                <button key={p.slug} className="plan-card-btn" data-familia={fam} onClick={() => onSelect(p.slug)}>
                  <div className="plan-card-top">
                    <span className="plan-card-nombre">{p.nombre}</span>
                    <span className="plan-card-arrow">→</span>
                  </div>
                  <div className="plan-card-range">
                    {range
                      ? (range.min === range.max
                          ? fmtUFShort(range.min)
                          : `${fmtUFShort(range.min)} – ${fmtUFShort(range.max)}`)
                      : <span className="plan-range-variable">precio variable</span>
                    }
                  </div>
                  <div className="plan-card-chips">
                    <span>{capLabel}</span>
                    <span>hasta {p.condiciones.cuotasMax} cuotas</span>
                    {p.mantencion && <span>mant. {fmtUFShort(p.mantencion)}/año</span>}
                    {beneficiosCount > 0 && <span>{beneficiosCount} beneficios</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function PlanDetail({ slug, onBack }) {
  const producto = PRODUCTOS.find(p => p.slug === slug)
  const [editing, setEditing] = useState(false)
  const [override, setOverride] = useState({})
  const [draft, setDraft] = useState({})

  useEffect(() => {
    getOverride(slug).then(setOverride).catch(console.error)
  }, [slug])

  function startEdit() {
    setDraft(JSON.parse(JSON.stringify(override)))
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setDraft({})
  }

  async function saveEdit() {
    await saveOverride(slug, draft).catch(console.error)
    setOverride(draft)
    setEditing(false)
    setDraft({})
  }

  async function resetToDefault() {
    if (!confirm('¿Restaurar valores por defecto del catálogo?')) return
    await resetOverride(slug).catch(console.error)
    setOverride({})
    setEditing(false)
  }

  // Merged: override on top of catalog defaults
  const cond = { ...producto.condiciones, ...override.condiciones }
  const parquesDisp = PARQUES.filter(p => !producto.noDisponibleEn.includes(p.slug))

  // Precios: merge catalog defaults with overrides
  function getPrecioMostrado(parqueSlug, cap) {
    return override.precios?.[parqueSlug]?.[cap]
      ?? override.precios?.['_todos']?.[cap]
      ?? producto.getPrecio(parqueSlug, cap)
  }

  function getDraftPrecio(parqueSlug, cap) {
    return draft.precios?.[parqueSlug]?.[cap] ?? ''
  }

  function setDraftPrecio(parqueSlug, cap, val) {
    setDraft(prev => ({
      ...prev,
      precios: {
        ...prev.precios,
        [parqueSlug]: {
          ...prev.precios?.[parqueSlug],
          [cap]: val === '' ? undefined : parseFloat(val),
        },
      },
    }))
  }

  function setDraftCond(key, val) {
    setDraft(prev => ({
      ...prev,
      condiciones: { ...prev.condiciones, [key]: val },
    }))
  }

  function getDraftCond(key) {
    return draft.condiciones?.[key] ?? cond[key] ?? ''
  }

  const beneficios = BENEFICIOS_POR_PRODUCTO[slug] || []
  const documentos = DOCUMENTOS_POR_PRODUCTO[slug] || []
  const hasOverrides = Object.keys(override).length > 0

  return (
    <div className="plan-detail">
      <div className="detail-topbar">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="detail-actions">
          {hasOverrides && !editing && (
            <button className="btn-reset" onClick={resetToDefault}>Restaurar defecto</button>
          )}
          {!editing
            ? <button className="btn-edit" onClick={startEdit}>Editar Plan</button>
            : <>
                <button className="btn-cancel" onClick={cancelEdit}>Cancelar</button>
                <button className="btn-save" onClick={saveEdit}>Guardar Cambios</button>
              </>
          }
        </div>
      </div>

      <div className="detail-header">
        <h2>{producto.nombre}</h2>
        <span className="familia-badge">{producto.familia}</span>
        {hasOverrides && <span className="modified-badge">Modificado</span>}
      </div>

      <div className="detail-grid">

        {/* CONDICIONES DE VENTA */}
        <div className="detail-card">
          <h3>Condiciones de Venta</h3>
          <table className="info-table">
            <tbody>
              <tr>
                <td>Pie mínimo</td>
                <td>
                  {editing
                    ? <input type="number" className="cell-input" value={getDraftCond('pieMin')} onChange={e => setDraftCond('pieMin', parseFloat(e.target.value))} />
                    : `${cond.pieMin}%`
                  }
                  {cond.pieMinPorParque && !editing && (
                    <span className="cond-nota">&nbsp;(El Prado: {cond.pieMinPorParque['el-prado']}%)</span>
                  )}
                </td>
              </tr>
              <tr>
                <td>Cuotas máx.</td>
                <td>
                  {editing
                    ? <input type="number" className="cell-input" value={getDraftCond('cuotasMax')} onChange={e => setDraftCond('cuotasMax', parseInt(e.target.value))} />
                    : `${cond.cuotasMax} meses`
                  }
                </td>
              </tr>
              <tr>
                <td>Carencia</td>
                <td>{cond.carencia ? 'Sí' : 'No'}</td>
              </tr>
              {cond.descuentoMax && (
                <tr>
                  <td>Descuento máx.</td>
                  <td>
                    {editing
                      ? <input type="number" className="cell-input" value={getDraftCond('descuentoMax')} onChange={e => setDraftCond('descuentoMax', parseFloat(e.target.value))} />
                      : `${cond.descuentoMax}%`
                    }
                  </td>
                </tr>
              )}
              {producto.mantencion && (
                <tr>
                  <td>Mantención anual</td>
                  <td>
                    {editing
                      ? <input type="number" className="cell-input" step="0.01" value={getDraftCond('mantencion') || producto.mantencion} onChange={e => setDraftCond('mantencion', parseFloat(e.target.value))} />
                      : formatUF(override.condiciones?.mantencion ?? producto.mantencion)
                    }
                  </td>
                </tr>
              )}
              {producto.zona && (
                <tr>
                  <td>Disponibilidad</td>
                  <td>Zona {producto.zona} — no disponible en El Prado</td>
                </tr>
              )}
              <tr>
                <td>Clasificaciones</td>
                <td>{producto.clasificaciones.join(', ')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PRECIOS */}
        <div className="detail-card">
          <h3>
            Lista de Precios (UF)
            {producto.getPrecio('el-manantial', producto.capacidades[0]) === null && !editing && (
              <span className="precio-nota"> — variable por parque/zona/área</span>
            )}
          </h3>
          <table className="price-table">
            <thead>
              <tr>
                <th>Parque</th>
                {producto.capacidades.map(c => (
                  <th key={c}>{producto.labelCapacidad === 'Capacidad' ? `${c} cap.` : `${c} años`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parquesDisp.map(parque => (
                <tr key={parque.slug}>
                  <td className="parque-cell">{parque.nombre}</td>
                  {producto.capacidades.map(cap => {
                    const precioBase = producto.getPrecio(parque.slug, cap)
                    const precioFinal = getPrecioMostrado(parque.slug, cap)
                    const isOverridden = override.precios?.[parque.slug]?.[cap] !== undefined
                    return (
                      <td key={cap} className={isOverridden ? 'cell-overridden' : ''}>
                        {editing ? (
                          <input
                            type="number"
                            className="cell-input"
                            step="0.01"
                            placeholder={precioBase ?? '—'}
                            value={getDraftPrecio(parque.slug, cap)}
                            onChange={e => setDraftPrecio(parque.slug, cap, e.target.value)}
                          />
                        ) : (
                          precioFinal !== null ? precioFinal : <span className="variable">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CAPACIDADES */}
        <div className="detail-card">
          <h3>Capacidades Disponibles</h3>
          <div className="cap-list">
            {producto.capacidades.map(c => (
              <span key={c} className="cap-tag">{c} {producto.labelCapacidad.toLowerCase()}</span>
            ))}
          </div>
        </div>

        {/* BENEFICIOS */}
        {beneficios.length > 0 && (
          <div className="detail-card">
            <h3>Beneficios</h3>
            <ul className="detail-list">
              {beneficios.map(b => <li key={b}>{b}</li>)}
            </ul>
          </div>
        )}

        {/* DOCUMENTOS */}
        {documentos.length > 0 && (
          <div className="detail-card">
            <h3>Documentos Comerciales</h3>
            <ul className="detail-list">
              {documentos.map(d => <li key={d}>{d}</li>)}
            </ul>
          </div>
        )}

        {/* TABLA PLANES NF */}
        {slug === 'servicio-funerario-nf' && (
          <div className="detail-card full-width">
            <h3>Tabla de Planes y Precios (UF / IVA incluido)</h3>
            <table className="price-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Cód.</th>
                  <th style={{ textAlign: 'left' }}>Plan</th>
                  <th>1 servicio</th>
                  <th>2 servicios</th>
                  <th>3 servicios</th>
                  <th>4 servicios</th>
                  <th>Activación</th>
                </tr>
              </thead>
              <tbody>
                {PLANES_NF.map(p => (
                  <tr key={p.codigo}>
                    <td style={{ textAlign: 'left', color: 'var(--ink-4)', fontWeight: 400 }}>{p.codigo}</td>
                    <td style={{ textAlign: 'left' }}>{p.nombre}</td>
                    <td>{p.precios[1]}</td>
                    <td>{p.precios[2]}</td>
                    <td>{p.precios[3]}</td>
                    <td>{p.precios[4]}</td>
                    <td style={{ color: 'var(--accent)' }}>15.0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* NOTAS */}
        <div className="detail-card full-width">
          <h3>Notas</h3>
          {editing ? (
            <textarea
              className="notas-input"
              rows={4}
              placeholder="Agregar notas sobre este plan..."
              value={draft.notas ?? override.notas ?? ''}
              onChange={e => setDraft(prev => ({ ...prev, notas: e.target.value }))}
            />
          ) : (
            <p className="notas-text">{override.notas || <span className="variable">Sin notas.</span>}</p>
          )}
        </div>

      </div>
    </div>
  )
}
