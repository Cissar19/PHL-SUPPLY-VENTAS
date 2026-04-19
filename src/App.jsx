import { useState, useEffect, useRef } from 'react'
import './App.css'
import { getCotizaciones, saveCotizacion, deleteCotizacion, updateCotizacion } from './storage'
import { calcularComision, applyCommissionOverrides } from './commissions'
import { applyFactorOverrides } from './factors'
import { supabase } from './supabase'
import { useAuth, signOut } from './AuthContext'
import LoginView from './LoginView'
import PlansView from './PlansView'
import ClientesView from './ClientesView'
import ResumenView from './ResumenView'
import { pdf } from '@react-pdf/renderer'
import CotizacionPDF from './PdfDocument'
import { AnimatedNumber, Field, TextInput, FieldSelect, Slider, Stepper } from './Primitives'
import {
  PRODUCTOS, PARQUES, PLANES_NF,
  getProducto, getParquesDisponibles, getPieMin, getPrecioNF,
} from './catalog'
import { getFactor, getCuotasForProducto } from './factors'
import { fetchUF, formatCLP } from './ufService'
import phlLogo from './assets/phl-ps-mark.png'

const TIPOS_SIMPLE = new Set(['funeraria-simple', 'cinerario-simple'])
const esSimple = (tipo) => TIPOS_SIMPLE.has(tipo)
const SLUG_INICIAL = 'sepultura-tradicional'
const FAMILIAS = ['Sepultura', 'Complementario', 'Mausoleo', 'Funeraria', 'Cinerario']

function formatUF(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `UF ${Number(value).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatRut(raw) {
  const clean = raw.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9)
  if (clean.length === 0) return ''
  const dv = clean.slice(-1)
  const num = clean.slice(0, -1)
  if (num.length === 0) return dv
  const formatted = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

function formatTelefono(raw) {
  const digits = raw.replace(/\D/g, '')
  // Strip leading 56 country code
  const local = digits.startsWith('56') ? digits.slice(2) : digits
  if (local.length === 0) return ''
  // Mobile: 9 + 8 digits
  if (local.startsWith('9') && local.length <= 9) {
    const n = local.slice(1)
    if (n.length <= 4) return `+56 9 ${n}`
    return `+56 9 ${n.slice(0, 4)} ${n.slice(4)}`
  }
  // Landline: 2 + 8 digits
  if (local.startsWith('2') && local.length <= 9) {
    const n = local.slice(1)
    if (n.length <= 4) return `+56 2 ${n}`
    return `+56 2 ${n.slice(0, 4)} ${n.slice(4)}`
  }
  return raw.slice(0, 16)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ─── Logo ──────────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <img src={phlLogo} alt="PHL Supply" style={{ height: 33, width: 'auto', display: 'block' }} />
      <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 17, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
        <span>PHL</span>
        <span style={{ fontWeight: 500, opacity: 0.75, marginLeft: 4 }}>SUPPLY</span>
      </div>
    </div>
  )
}

// ─── TopBar ────────────────────────────────────────────────────────────────

function TopBar({ tab, onTab, cotizacionesCount, onReset, userEmail }) {
  const navItems = [
    { key: 'nueva', label: 'Nueva cotización' },
    { key: 'guardadas', label: 'Guardadas', count: cotizacionesCount },
    { key: 'clientes', label: 'Mis clientes' },
    { key: 'planes', label: 'Parques' },
    { key: 'resumen', label: 'Resumen' },
  ]
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'NP'
  const shortName = userEmail ? userEmail.split('@')[0] : 'Asesor'
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <LogoMark />
        <nav className="topbar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              type="button"
              className={`tnav ${tab === item.key ? 'is-active' : ''}`}
              onClick={() => onTab(item.key)}
            >
              {item.label}
              {item.count > 0 && <span className="tnav-count">{item.count}</span>}
            </button>
          ))}
        </nav>
        <div className="topbar-actions">
          <button type="button" className="icon-btn" onClick={onReset} title="Nueva cotización">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3 V13 M3 8 H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="user-chip" title={userEmail}>
            <div className="user-avatar">{initials}</div>
            <span>{shortName}</span>
          </div>
          <button type="button" className="icon-btn" onClick={signOut} title="Cerrar sesión">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3H3v10h3M10 5l3 3-3 3M7 8h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

// ─── ProgressRail ──────────────────────────────────────────────────────────

function ProgressRail({ step, onStep }) {
  const steps = ['Cliente', 'Producto', 'Financiamiento', 'Resumen']
  return (
    <div className="progress-rail">
      <div className="progress-inner">
        {steps.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`prog-step ${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}`}
            onClick={() => onStep(i)}
          >
            <span className="prog-num">
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2 L5 8.5 L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (i + 1)}
            </span>
            <span className="prog-label">{label}</span>
          </button>
        ))}
        <div className="prog-bar">
          <div className="prog-fill" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

// ─── StepCliente ───────────────────────────────────────────────────────────

function StepCliente({ primerNombre, setPrimerNombre, segundoNombre, setSegundoNombre, apellidoPaterno, setApellidoPaterno, apellidoMaterno, setApellidoMaterno, rut, setRut, telefono, setTelefono }) {
  return (
    <div className="step-panel">
      <div className="step-heading">
        <div className="step-kicker">Paso 1 de 4</div>
        <h2 className="step-title">¿Para quién es esta cotización?</h2>
        <p className="step-sub">Ingresa los datos del titular. Puedes corregirlos más tarde.</p>
      </div>
      <div className="form-grid" style={{ '--cols': 6 }}>
        <Field label="Primer nombre" span={3}>
          <TextInput value={primerNombre} onChange={setPrimerNombre} placeholder="Juan" />
        </Field>
        <Field label="Segundo nombre" span={3}>
          <TextInput value={segundoNombre} onChange={setSegundoNombre} placeholder="Carlos" />
        </Field>
        <Field label="Apellido paterno" span={3}>
          <TextInput value={apellidoPaterno} onChange={setApellidoPaterno} placeholder="González" />
        </Field>
        <Field label="Apellido materno" span={3}>
          <TextInput value={apellidoMaterno} onChange={setApellidoMaterno} placeholder="Pérez" />
        </Field>
        <Field label="RUT" hint="Se formatea automáticamente" span={3}>
          <TextInput value={rut} onChange={v => setRut(formatRut(v))} placeholder="12.345.678-9" />
        </Field>
        <Field label="Teléfono" span={3}>
          <TextInput value={telefono} onChange={v => setTelefono(formatTelefono(v))} placeholder="+56 9 1234 5678" />
        </Field>
      </div>
    </div>
  )
}

// ─── StepProducto ──────────────────────────────────────────────────────────

function StepProducto({ productoSlug, handleProductoChange, parqueSlug, handleParqueChange, capacidad, handleCapacidadChange, planNFCodigo, handlePlanNFChange }) {
  const producto = getProducto(productoSlug)
  const initialFamilia = producto?.familia ?? 'Sepultura'
  const [familia, setFamilia] = useState(initialFamilia)

  useEffect(() => {
    const f = getProducto(productoSlug)?.familia
    if (f) setFamilia(f)
  }, [productoSlug])

  const productosEnFamilia = PRODUCTOS.filter(p => p.familia === familia)
  const parquesDisponibles = getParquesDisponibles(productoSlug)
  const isNF = producto?.tipo === 'funeraria-nf' || producto?.tipo === 'cinerario-nf'

  function handleFamiliaChange(f) {
    setFamilia(f)
    const first = PRODUCTOS.find(p => p.familia === f)
    if (first) handleProductoChange(first.slug)
  }

  return (
    <div className="step-panel">
      <div className="step-heading">
        <div className="step-kicker">Paso 2 de 4</div>
        <h2 className="step-title">Elige el producto</h2>
        <p className="step-sub">Selecciona el tipo de producto y la ubicación del parque.</p>
      </div>

      <div className="capacity-row" style={{ marginBottom: 20 }}>
        {FAMILIAS.map(f => (
          <button key={f} type="button" className={`chip ${familia === f ? 'is-active' : ''}`} onClick={() => handleFamiliaChange(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="product-cards">
        {productosEnFamilia.map(p => (
          <button
            key={p.slug}
            type="button"
            className={`product-card ${productoSlug === p.slug ? 'is-active' : ''}`}
            onClick={() => handleProductoChange(p.slug)}
          >
            <div className="pc-radio" />
            <div>
              <div className="pc-title">{p.nombre}</div>
              {p.precioDescripcion && <div className="pc-desc">{p.precioDescripcion}</div>}
            </div>
          </button>
        ))}
      </div>

      <div className="form-grid" style={{ '--cols': 2, marginTop: 28 }}>
        {!esSimple(producto?.tipo) && !isNF && (
          <Field label="Cementerio Parque" span={1}>
            <FieldSelect
              value={parqueSlug}
              onChange={handleParqueChange}
              options={parquesDisponibles.map(p => ({ value: p.slug, label: p.nombre }))}
            />
          </Field>
        )}

        {!esSimple(producto?.tipo) && (
          <Field label={producto?.labelCapacidad ?? 'Capacidad'} hint="Número de personas" span={1}>
            <div className="capacity-row">
              {(producto?.capacidades ?? []).map(c => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${capacidad === c ? 'is-active' : ''}`}
                  onClick={() => handleCapacidadChange(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
        )}

        {isNF && (
          <Field label="Plan" span={2}>
            <FieldSelect
              value={planNFCodigo}
              onChange={v => handlePlanNFChange(Number(v))}
              options={PLANES_NF.map(p => ({ value: p.codigo, label: `${p.codigo} — ${p.nombre}` }))}
            />
          </Field>
        )}
      </div>

      {producto?.zona && (
        <p className="nota-zona">Disponible en Zona {producto.zona} — no disponible en El Prado</p>
      )}
    </div>
  )
}

// ─── StepFinanciamiento ────────────────────────────────────────────────────

function StepFinanciamiento({
  producto, parqueSlug, capacidad,
  valorSepultura, setValorSepultura,
  descuento, handleDescuento,
  piePorc, pieUF, handlePiePorc, handlePieUF,
  cuotas, setCuotas, carencia, setCarencia,
  clasificacion, setClasificacion,
  numSepulturas, setNumSepulturas,
  cuotasOptions, pieMinimo,
}) {
  const tipo = producto?.tipo
  const isSimple = esSimple(tipo)
  const cuotasMax = producto?.condiciones?.cuotasMax
  const descuentoMax = producto?.condiciones?.descuentoMax ?? 30
  const precioFijo = producto?.getPrecio?.(parqueSlug, capacidad)
  const isFixed = tipo === 'funeraria-nf' || (precioFijo !== null && precioFijo !== undefined)

  const descNum = parseFloat(descuento) || 0
  const piePorcNum = parseFloat(piePorc) || 0

  const carenciaOptions = producto?.condiciones?.carenciaMeses
    ? [
        { value: 0, label: 'Sin carencia' },
        { value: producto.condiciones.carenciaMeses, label: `${producto.condiciones.carenciaMeses} meses` },
      ]
    : [
        { value: 0, label: 'Sin carencia' },
        { value: 1, label: '1 mes' },
        { value: 2, label: '2 meses' },
        { value: 3, label: '3 meses' },
      ]

  return (
    <div className="step-panel">
      <div className="step-heading">
        <div className="step-kicker">Paso 3 de 4</div>
        <h2 className="step-title">Arma el financiamiento</h2>
        <p className="step-sub">Ajusta los valores y verás el resumen actualizarse en vivo a la derecha.</p>
      </div>

      <div className="form-grid" style={{ '--cols': 2 }}>
        <Field
          label={`Valor (UF)${isFixed ? ' — precio fijo' : ''}`}
          span={isSimple ? 2 : 1}
        >
          <TextInput
            type="number" min="0" step="0.0001" placeholder="0.0000"
            value={valorSepultura}
            onChange={setValorSepultura}
            readOnly={isFixed}
            suffix="UF"
            align="right"
          />
        </Field>

        {!isSimple && (
          <Field label={`Descuento — ${descNum}%${descuentoMax ? ` (máx. ${descuentoMax}%)` : ''}`} span={1}>
            <Slider
              value={descNum}
              onChange={v => handleDescuento(String(v))}
              min={0}
              max={descuentoMax}
              step={0.5}
              marks={[0, Math.round(descuentoMax / 3), Math.round((descuentoMax * 2) / 3), descuentoMax]}
            />
          </Field>
        )}

        {!isSimple && cuotasMax && (
          <>
            <Field label={`Pie — ${piePorcNum.toFixed(1)}% (mín. ${pieMinimo}%)`} span={1}>
              <Slider
                value={piePorcNum}
                onChange={handlePiePorc}
                min={pieMinimo}
                max={100}
                step={0.5}
                marks={[pieMinimo, 25, 50, 75, 100]}
              />
            </Field>
            <Field label="Pie (UF)" hint="Equivalente al porcentaje de pie" span={1}>
              <TextInput
                type="number" min="0" step="0.0001" placeholder="0.0000"
                value={pieUF}
                onChange={handlePieUF}
                suffix="UF"
                align="right"
              />
            </Field>

            <Field label="Nº de cuotas" span={1}>
              <FieldSelect
                value={cuotas}
                onChange={v => setCuotas(Number(v))}
                options={cuotasOptions.map(c => ({
                  value: c,
                  label: `${c} meses (${c / 12} ${c / 12 === 1 ? 'año' : 'años'})`,
                }))}
              />
            </Field>

            {producto?.condiciones?.carencia && (
              <Field label={`Carencia${producto.condiciones.carenciaMeses ? ` (${producto.condiciones.carenciaMeses}m)` : ''}`} span={1}>
                <FieldSelect
                  value={carencia}
                  onChange={v => setCarencia(Number(v))}
                  options={carenciaOptions}
                />
              </Field>
            )}
          </>
        )}

        {producto?.clasificaciones?.length > 0 && (
          <Field label="Clasificación" span={1}>
            <FieldSelect
              value={clasificacion}
              onChange={setClasificacion}
              options={[
                { value: '', label: '— Seleccionar —' },
                ...producto.clasificaciones.map(c => ({ value: c, label: `Clasificación ${c}` })),
              ]}
            />
          </Field>
        )}

        {producto?.comisionPorSepulturas && (
          <Field label="Nº de sepulturas" span={1}>
            <Stepper value={numSepulturas} onChange={setNumSepulturas} min={1} max={20} />
          </Field>
        )}
      </div>

      {isSimple && (
        <p className="nota-zona">
          Pago al contado
          {producto?.tipo === 'funeraria-simple' ? ' — comisión 5% + activación FNP 3%' : ' — comisión 5%'}
        </p>
      )}
    </div>
  )
}

// ─── StepResumen ───────────────────────────────────────────────────────────

function StepResumen({ primerNombre, apellidoPaterno, rut, productoNombre, parqueNombre, capacidad, valorConDescuento, saldoSepultura, cuotaMensual, cuotas, carencia, descuento, comision, ufValue }) {
  const clienteNombre = [primerNombre, apellidoPaterno].filter(Boolean).join(' ') || '—'
  const desc = parseFloat(descuento) || 0
  return (
    <div className="step-panel">
      <div className="step-heading">
        <div className="step-kicker">Paso 4 de 4 · Revisar</div>
        <h2 className="step-title">Todo listo. ¿Guardamos?</h2>
        <p className="step-sub">Revisa los detalles antes de emitir la cotización.</p>
      </div>
      <div className="summary-cards">
        <div className="sum-card">
          <div className="sum-label">Titular</div>
          <div className="sum-value" style={{ fontSize: 18 }}>{clienteNombre}</div>
          <div className="sum-meta">{rut || 'RUT —'}</div>
        </div>
        <div className="sum-card">
          <div className="sum-label">Producto</div>
          <div className="sum-value" style={{ fontSize: 16 }}>{productoNombre || '—'}</div>
          <div className="sum-meta">
            {parqueNombre ? `${parqueNombre} · Cap. ${capacidad}` : `Cap. ${capacidad}`}
          </div>
        </div>
        <div className="sum-card sum-highlight">
          <div className="sum-label">Cuota mensual estimada</div>
          <div className="sum-value big-number">
            {cuotaMensual !== null && cuotaMensual > 0
              ? <AnimatedNumber value={cuotaMensual} decimals={2} prefix="UF " />
              : <span style={{ fontSize: 24, opacity: 0.6 }}>—</span>
            }
          </div>
          <div className="sum-meta">
            {cuotas} meses{carencia > 0 ? ` + ${carencia} carencia` : ''}
            {ufValue && cuotaMensual ? ` · ≈ ${formatCLP(cuotaMensual, ufValue)}` : ''}
          </div>
        </div>
        <div className="sum-card">
          <div className="sum-label">Valor con descuento</div>
          <div className="sum-value">
            {valorConDescuento !== null
              ? <AnimatedNumber value={valorConDescuento} decimals={2} prefix="UF " />
              : '—'}
          </div>
          <div className="sum-meta">Descuento {desc}%</div>
        </div>
        <div className="sum-card">
          <div className="sum-label">Saldo financiado</div>
          <div className="sum-value">
            {saldoSepultura !== null
              ? <AnimatedNumber value={saldoSepultura} decimals={2} prefix="UF " />
              : '—'}
          </div>
          <div className="sum-meta">Después del pie</div>
        </div>
        {comision && (
          <div className="sum-card">
            <div className="sum-label">Comisión</div>
            <div className="sum-value" style={{ color: 'var(--success)', fontSize: 20 }}>
              {comision.porcentaje}%
            </div>
            <div className="sum-meta">
              <AnimatedNumber value={comision.uf} decimals={2} prefix="UF " />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── LiveSummary ───────────────────────────────────────────────────────────

function LiveSummary({ titular, ufValue, ufError, valorUF, descuentoValor, valorConDescuento, pieUFNum, saldoSepultura, cuotaMensual, factor, cuotas, carencia, comision, mantencion, onSave, puedeGuardar, isMobile }) {
  return (
    <aside className={`live ${isMobile ? 'is-mobile' : ''}`}>
      <div className="live-header">
        <div>
          <div className="live-kicker">Resumen vivo</div>
          <div className="live-titular">{titular}</div>
        </div>
        {ufValue && (
          <div className="live-uf">
            <span className="live-uf-label">UF hoy</span>
            <span className="live-uf-value">
              ${ufValue.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
        {ufError && (
          <div className="live-uf">
            <span className="live-uf-label">UF</span>
            <span className="live-uf-value" style={{ color: 'var(--danger)' }}>No disp.</span>
          </div>
        )}
      </div>

      <div className="live-hero">
        <div className="live-hero-label">Cuota mensual estimada</div>
        <div className="live-hero-value">
          <span className="live-uf-tag">UF</span>
          {cuotaMensual !== null && cuotaMensual > 0
            ? <AnimatedNumber value={cuotaMensual} decimals={4} />
            : <span style={{ fontSize: 22, opacity: 0.5 }}>—</span>
          }
        </div>
        <div className="live-hero-meta">
          {cuotas} meses{carencia > 0 ? ` + ${carencia} carencia` : ''}
          {ufValue && cuotaMensual
            ? ` · ≈ ${formatCLP(cuotaMensual, ufValue)}`
            : factor === null && cuotaMensual === null ? ' · Pendiente tabla factores' : ''}
        </div>
      </div>

      <ul className="live-rows">
        <li className="live-row">
          <span className="live-row-label">Valor base</span>
          <span className="live-row-value">
            {valorUF > 0 ? <AnimatedNumber value={valorUF} decimals={2} suffix=" UF" /> : '—'}
          </span>
        </li>
        <li className="live-row">
          <span className="live-row-label">Descuento</span>
          <span className="live-row-value">
            {descuentoValor > 0 ? <>− <AnimatedNumber value={descuentoValor} decimals={2} suffix=" UF" /></> : '—'}
          </span>
        </li>
        <li className="live-row is-strong">
          <span className="live-row-label">Valor con descuento</span>
          <span className="live-row-value">
            {valorConDescuento !== null
              ? <AnimatedNumber value={valorConDescuento} decimals={2} suffix=" UF" />
              : '—'}
          </span>
        </li>
        <li className="live-row">
          <span className="live-row-label">Pie</span>
          <span className="live-row-value">
            {pieUFNum > 0 ? <>− <AnimatedNumber value={pieUFNum} decimals={2} suffix=" UF" /></> : '—'}
          </span>
        </li>
        <li className="live-row is-strong">
          <span className="live-row-label">Saldo financiado</span>
          <span className="live-row-value">
            {saldoSepultura !== null
              ? <AnimatedNumber value={saldoSepultura} decimals={2} suffix=" UF" />
              : '—'}
          </span>
        </li>
        {mantencion && (
          <li className="live-row">
            <span className="live-row-label">Mantención anual</span>
            <span className="live-row-value">
              <AnimatedNumber value={mantencion} decimals={2} suffix=" UF" />
            </span>
          </li>
        )}
        {comision && (
          <li className="live-row is-commission">
            <span className="live-row-label">Comisión {comision.porcentaje}%</span>
            <span className="live-row-value">
              <AnimatedNumber value={comision.uf} decimals={2} suffix=" UF" />
            </span>
          </li>
        )}
      </ul>

      <button
        type="button"
        className="save-btn"
        onClick={onSave}
        disabled={!puedeGuardar}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8 L6.5 11.5 L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Guardar cotización
      </button>
    </aside>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const { session } = useAuth()

  // session === undefined means still loading auth
  if (session === undefined) return null
  if (session === null) return <LoginView />

  return <AppInner user={session.user} />
}

function AppInner({ user }) {
  // Navigation
  const [tab, setTab] = useState('nueva')
  const [step, setStep] = useState(0)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 960)
  const [showMobileSummary, setShowMobileSummary] = useState(false)

  // Saved quotes
  const [cotizaciones, setCotizaciones] = useState([])
  const [busquedaGuardadas, setBusquedaGuardadas] = useState('')
  const [toast, setToast] = useState(null)
  const notaTimers = useRef({})

  // UF
  const [ufValue, setUfValue] = useState(null)
  const [ufError, setUfError] = useState(false)

  // Cliente
  const [primerNombre, setPrimerNombre] = useState('')
  const [segundoNombre, setSegundoNombre] = useState('')
  const [apellidoPaterno, setApellidoPaterno] = useState('')
  const [apellidoMaterno, setApellidoMaterno] = useState('')
  const [rut, setRut] = useState('')
  const [telefono, setTelefono] = useState('')

  // Producto
  const [productoSlug, setProductoSlug] = useState(SLUG_INICIAL)
  const [parqueSlug, setParqueSlug] = useState('el-manantial')
  const [capacidad, setCapacidad] = useState(2)
  const [numSepulturas, setNumSepulturas] = useState(1)
  const [clasificacion, setClasificacion] = useState('')
  const [planNFCodigo, setPlanNFCodigo] = useState(PLANES_NF[0].codigo)

  // Financiamiento
  const [valorSepultura, setValorSepultura] = useState('')
  const [descuento, setDescuento] = useState('0')
  const [piePorc, setPiePorc] = useState('')
  const [pieUF, setPieUF] = useState('')
  const [cuotas, setCuotas] = useState(24)
  const [carencia, setCarencia] = useState(0)

  useEffect(() => {
    getCotizaciones().then(setCotizaciones).catch(console.error)
  }, [])

  // Load factor and commission tables from DB, apply as overrides
  useEffect(() => {
    Promise.all([
      supabase.from('factor_tables').select('tabla_key, factors'),
      supabase.from('commission_tables').select('tabla_key, tabla'),
    ]).then(([{ data: ft }, { data: ct }]) => {
      if (ft?.length) {
        const tables = Object.fromEntries(ft.map(r => [r.tabla_key, r.factors]))
        applyFactorOverrides(tables)
      }
      if (ct?.length) {
        const tables = Object.fromEntries(ct.map(r => [r.tabla_key, r.tabla]))
        applyCommissionOverrides(tables)
      }
    }).catch(console.error)
  }, [])

  useEffect(() => {
    fetchUF().then(v => setUfValue(v)).catch(() => setUfError(true))
  }, [])
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 960)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  // Derived
  const producto = getProducto(productoSlug)
  const parquesDisponibles = getParquesDisponibles(productoSlug)
  const cuotasOptions = getCuotasForProducto(productoSlug, producto?.condiciones.cuotasMax)
  const pieMinimo = getPieMin(productoSlug, parqueSlug)

  // Financial calculations
  const valor = parseFloat(valorSepultura) || 0
  const desc = parseFloat(descuento) || 0
  const valorConDescuento = valor > 0 ? valor * (1 - desc / 100) : null
  const pieUFNum = parseFloat(pieUF) || 0
  const saldoSepultura = valorConDescuento !== null ? valorConDescuento - pieUFNum : null
  const factor = getFactor(productoSlug, cuotas)
  const cuotaMensual = saldoSepultura !== null && factor !== null ? saldoSepultura * factor : null
  const comision = calcularComision(valorConDescuento, productoSlug, numSepulturas, clasificacion)
  const puedeGuardar = valorSepultura && (primerNombre || rut)

  // Auto-price when product/park/capacity changes
  function tryAutoPrecio(prod, pSlug, cap, codigoNF) {
    let precio = null
    if (prod?.tipo === 'funeraria-nf') {
      precio = getPrecioNF(codigoNF ?? planNFCodigo, cap)
    } else {
      precio = prod?.getPrecio(pSlug, cap)
    }
    if (precio !== null && precio !== undefined) {
      setValorSepultura(String(precio))
    } else {
      setValorSepultura('')
    }
    setPiePorc('')
    setPieUF('')
  }

  function handleProductoChange(slug) {
    setProductoSlug(slug)
    const prod = getProducto(slug)
    const parquesOk = PARQUES.filter(p => !prod.noDisponibleEn.includes(p.slug))
    const nuevoParque = parquesOk.find(p => p.slug === parqueSlug) ? parqueSlug : parquesOk[0]?.slug ?? 'el-manantial'
    setParqueSlug(nuevoParque)
    const primCap = prod.capacidades[0]
    setCapacidad(primCap)
    const cuotasOk = getCuotasForProducto(slug, prod.condiciones.cuotasMax)
    if (!cuotasOk.includes(cuotas)) setCuotas(cuotasOk[0] ?? 24)
    if (!prod.clasificaciones.includes(clasificacion)) setClasificacion('')
    setCarencia(0)
    setDescuento('0')
    tryAutoPrecio(prod, nuevoParque, primCap)
  }

  function handleParqueChange(slug) {
    setParqueSlug(slug)
    tryAutoPrecio(producto, slug, capacidad)
  }

  function handleCapacidadChange(cap) {
    setCapacidad(cap)
    tryAutoPrecio(producto, parqueSlug, cap)
  }

  function handlePlanNFChange(codigo) {
    setPlanNFCodigo(codigo)
    tryAutoPrecio(producto, parqueSlug, capacidad, codigo)
  }

  function handleDescuento(val) {
    setDescuento(val)
    const p = parseFloat(piePorc)
    const d = parseFloat(val) || 0
    const newVCD = valor > 0 ? valor * (1 - d / 100) : null
    if (!isNaN(p) && newVCD) {
      setPieUF((newVCD * p / 100).toFixed(4))
    }
  }

  function handlePiePorc(val) {
    const strVal = String(val)
    setPiePorc(strVal)
    const p = parseFloat(strVal)
    if (!isNaN(p) && valorConDescuento) {
      setPieUF((valorConDescuento * p / 100).toFixed(4))
    } else {
      setPieUF('')
    }
  }

  function handlePieUF(val) {
    setPieUF(val)
    const u = parseFloat(val)
    if (!isNaN(u) && valorConDescuento && valorConDescuento > 0) {
      setPiePorc(((u / valorConDescuento) * 100).toFixed(2))
    } else {
      setPiePorc('')
    }
  }

  // Keep pieUF in sync when valorConDescuento changes (due to discount change)
  useEffect(() => {
    const p = parseFloat(piePorc)
    if (!isNaN(p) && p > 0 && valorConDescuento) {
      setPieUF((valorConDescuento * p / 100).toFixed(4))
    }
  }, [valorConDescuento]) // eslint-disable-line

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  async function handleGuardar() {
    const parqueNombre = parquesDisponibles.find(p => p.slug === parqueSlug)?.nombre
    const item = await saveCotizacion({
      primerNombre, segundoNombre, apellidoPaterno, apellidoMaterno,
      nombre: [primerNombre, segundoNombre, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' '),
      rut, telefono,
      productoSlug, productoNombre: producto?.nombre,
      parqueSlug, parqueNombre,
      capacidad, numSepulturas, clasificacion,
      valorSepultura: valor, descuento: desc,
      piePorc: parseFloat(piePorc) || 0, pieUF: pieUFNum,
      cuotas, carencia,
      valorConDescuento, saldoSepultura, cuotaMensual,
      comision,
    }).catch(err => { showToast('⚠ Error al guardar: ' + err.message); return null })
    if (!item) return
    setCotizaciones(prev => [item, ...prev])
    showToast('✓ Cotización guardada correctamente')
    setTab('guardadas')
  }

  function handleEliminar(id) {
    // Optimistic
    setCotizaciones(prev => prev.filter(c => c.id !== id))
    deleteCotizacion(id).catch(console.error)
  }

  function handleEstado(id, estado) {
    // Optimistic
    setCotizaciones(prev => prev.map(c => c.id === id ? { ...c, estado } : c))
    updateCotizacion(id, { estado }).catch(console.error)
  }

  function handleNota(id, nota) {
    // Optimistic local update, debounced DB write
    setCotizaciones(prev => prev.map(c => c.id === id ? { ...c, nota } : c))
    clearTimeout(notaTimers.current[id])
    notaTimers.current[id] = setTimeout(() => {
      updateCotizacion(id, { nota }).catch(console.error)
    }, 600)
  }

  async function handleExportPdf(cot) {
    try {
      const blob = await pdf(<CotizacionPDF cot={cot} ufValue={ufValue} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Cotización — Nuestros Parques.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      showToast('⚠ Error al generar PDF: ' + err.message)
    }
  }

  function handleDuplicar(c) {
    setProductoSlug(c.productoSlug || SLUG_INICIAL)
    const prod = getProducto(c.productoSlug || SLUG_INICIAL)
    const parquesOk = PARQUES.filter(p => !prod.noDisponibleEn.includes(p.slug))
    const pSlug = parquesOk.find(p => p.slug === c.parqueSlug) ? c.parqueSlug : parquesOk[0]?.slug ?? 'el-manantial'
    setParqueSlug(pSlug)
    setCapacidad(c.capacidad ?? prod.capacidades[0])
    setNumSepulturas(c.numSepulturas ?? 1)
    setClasificacion(c.clasificacion ?? '')
    setValorSepultura(c.valorSepultura ? String(c.valorSepultura) : '')
    setDescuento(c.descuento ? String(c.descuento) : '0')
    setPiePorc(c.piePorc ? String(c.piePorc) : '')
    setPieUF(c.pieUF ? String(c.pieUF) : '')
    const cuotasOk = getCuotasForProducto(c.productoSlug, prod?.condiciones.cuotasMax)
    setCuotas(cuotasOk.includes(c.cuotas) ? c.cuotas : cuotasOk[0] ?? 24)
    setCarencia(c.carencia ?? 0)
    setPrimerNombre(c.primerNombre ?? '')
    setSegundoNombre(c.segundoNombre ?? '')
    setApellidoPaterno(c.apellidoPaterno ?? '')
    setApellidoMaterno(c.apellidoMaterno ?? '')
    setRut(c.rut ?? '')
    setTelefono(c.telefono ?? '')
    setStep(0)
    setTab('nueva')
  }

  function handleReset() {
    if (!confirm('¿Comenzar una nueva cotización? Se perderán los datos actuales.')) return
    setPrimerNombre(''); setSegundoNombre(''); setApellidoPaterno(''); setApellidoMaterno('')
    setRut(''); setTelefono('')
    setProductoSlug(SLUG_INICIAL); setParqueSlug('el-manantial'); setCapacidad(2)
    setNumSepulturas(1); setClasificacion(''); setPlanNFCodigo(PLANES_NF[0].codigo)
    setValorSepultura(''); setDescuento('0'); setPiePorc(''); setPieUF('')
    setCuotas(24); setCarencia(0)
    setStep(0); setTab('nueva')
  }

  function canAdvance() {
    if (step === 0) return !!(primerNombre.trim() || rut.trim())
    if (step === 1) return true
    if (step === 2) return valor > 0
    return !!puedeGuardar
  }

  const titular = [primerNombre, apellidoPaterno].filter(Boolean).join(' ') || 'Cliente'
  const descuentoValor = valor * desc / 100

  return (
    <div className="app accent-forest density-spacious">
      <TopBar
        tab={tab}
        onTab={setTab}
        cotizacionesCount={cotizaciones.length}
        onReset={handleReset}
        userEmail={user.email}
      />

      {tab === 'nueva' && (
        <>
          <ProgressRail step={step} onStep={setStep} />
          <main className="main">
            <div className="main-inner">
              <div className="main-col">
                <div className="step-wrap" key={step}>
                  {step === 0 && (
                    <StepCliente
                      primerNombre={primerNombre} setPrimerNombre={setPrimerNombre}
                      segundoNombre={segundoNombre} setSegundoNombre={setSegundoNombre}
                      apellidoPaterno={apellidoPaterno} setApellidoPaterno={setApellidoPaterno}
                      apellidoMaterno={apellidoMaterno} setApellidoMaterno={setApellidoMaterno}
                      rut={rut} setRut={setRut}
                      telefono={telefono} setTelefono={setTelefono}
                    />
                  )}
                  {step === 1 && (
                    <StepProducto
                      productoSlug={productoSlug}
                      handleProductoChange={handleProductoChange}
                      parqueSlug={parqueSlug}
                      handleParqueChange={handleParqueChange}
                      capacidad={capacidad}
                      handleCapacidadChange={handleCapacidadChange}
                      planNFCodigo={planNFCodigo}
                      handlePlanNFChange={handlePlanNFChange}
                    />
                  )}
                  {step === 2 && (
                    <StepFinanciamiento
                      producto={producto}
                      parqueSlug={parqueSlug}
                      capacidad={capacidad}
                      valorSepultura={valorSepultura} setValorSepultura={setValorSepultura}
                      descuento={descuento} handleDescuento={handleDescuento}
                      piePorc={piePorc} pieUF={pieUF}
                      handlePiePorc={handlePiePorc} handlePieUF={handlePieUF}
                      cuotas={cuotas} setCuotas={setCuotas}
                      carencia={carencia} setCarencia={setCarencia}
                      clasificacion={clasificacion} setClasificacion={setClasificacion}
                      numSepulturas={numSepulturas} setNumSepulturas={setNumSepulturas}
                      cuotasOptions={cuotasOptions}
                      pieMinimo={pieMinimo}
                    />
                  )}
                  {step === 3 && (
                    <StepResumen
                      primerNombre={primerNombre}
                      apellidoPaterno={apellidoPaterno}
                      rut={rut}
                      productoNombre={producto?.nombre}
                      parqueNombre={parquesDisponibles.find(p => p.slug === parqueSlug)?.nombre}
                      capacidad={capacidad}
                      valorConDescuento={valorConDescuento}
                      saldoSepultura={saldoSepultura}
                      cuotaMensual={cuotaMensual}
                      cuotas={cuotas}
                      carencia={carencia}
                      descuento={descuento}
                      comision={comision}
                      ufValue={ufValue}
                    />
                  )}
                </div>

                <div className="step-nav">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                  >
                    ← Atrás
                  </button>
                  {step < 3 ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setStep(s => Math.min(3, s + 1))}
                      disabled={!canAdvance()}
                    >
                      Continuar →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGuardar}
                      disabled={!puedeGuardar}
                    >
                      Guardar cotización
                    </button>
                  )}
                </div>
              </div>

              {!isMobile && (
                <LiveSummary
                  titular={titular}
                  ufValue={ufValue}
                  ufError={ufError}
                  valorUF={valor}
                  descuentoValor={descuentoValor}
                  valorConDescuento={valorConDescuento}
                  pieUFNum={pieUFNum}
                  saldoSepultura={saldoSepultura}
                  cuotaMensual={cuotaMensual}
                  factor={factor}
                  cuotas={cuotas}
                  carencia={carencia}
                  comision={comision}
                  mantencion={producto?.mantencion}
                  onSave={handleGuardar}
                  puedeGuardar={!!puedeGuardar}
                  isMobile={false}
                />
              )}
            </div>
          </main>

          {isMobile && (
            <>
              <button
                type="button"
                className={`mobile-summary-tab ${showMobileSummary ? 'is-open' : ''}`}
                onClick={() => setShowMobileSummary(s => !s)}
              >
                <div>
                  <div className="msm-label">Cuota mensual</div>
                  <div className="msm-value">
                    {cuotaMensual !== null && cuotaMensual > 0
                      ? <AnimatedNumber value={cuotaMensual} decimals={2} prefix="UF " />
                      : 'UF —'}
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transform: showMobileSummary ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }}>
                  <path d="M4 7 L9 12 L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showMobileSummary && (
                <div className="mobile-summary-sheet" onClick={() => setShowMobileSummary(false)}>
                  <div className="mss-inner" onClick={e => e.stopPropagation()}>
                    <LiveSummary
                      titular={titular}
                      ufValue={ufValue}
                      ufError={ufError}
                      valorUF={valor}
                      descuentoValor={descuentoValor}
                      valorConDescuento={valorConDescuento}
                      pieUFNum={pieUFNum}
                      saldoSepultura={saldoSepultura}
                      cuotaMensual={cuotaMensual}
                      factor={factor}
                      cuotas={cuotas}
                      carencia={carencia}
                      comision={comision}
                      mantencion={producto?.mantencion}
                      onSave={handleGuardar}
                      puedeGuardar={!!puedeGuardar}
                      isMobile={true}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === 'guardadas' && (
        <main className="main">
          <div className="main-single">
            <div className="guardadas-toolbar">
              <input
                className="search-input"
                type="text"
                placeholder="Buscar por nombre, RUT o producto…"
                value={busquedaGuardadas}
                onChange={e => setBusquedaGuardadas(e.target.value)}
              />
            </div>
            {cotizaciones.length === 0 ? (
              <div className="empty">No hay cotizaciones guardadas.</div>
            ) : (() => {
              const q = busquedaGuardadas.trim().toLowerCase()
              const filtradas = q
                ? cotizaciones.filter(c =>
                    (c.nombre || '').toLowerCase().includes(q) ||
                    (c.rut || '').toLowerCase().includes(q) ||
                    (c.productoNombre || '').toLowerCase().includes(q)
                  )
                : cotizaciones
              if (filtradas.length === 0) return <div className="empty">Sin resultados.</div>
              return filtradas.map(c => (
                <div key={c.id} className="quote-card">
                  <div className="quote-header">
                    <div>
                      <span className="quote-nombre">{c.nombre || [c.primerNombre, c.apellidoPaterno].filter(Boolean).join(' ') || 'Sin nombre'}</span>
                      {c.rut && <span className="quote-rut"> · {c.rut}</span>}
                    </div>
                    <div className="quote-meta">
                      {c.productoNombre && <span className="quote-producto">{c.productoNombre}</span>}
                      {c.parqueNombre && <span>{c.parqueNombre}</span>}
                      <span>{formatDate(c.fecha)}</span>
                      <select
                        className={`estado-select estado-${c.estado || 'pendiente'}`}
                        value={c.estado || 'pendiente'}
                        onChange={e => handleEstado(c.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="enviada">Enviada</option>
                        <option value="cerrada">Cerrada</option>
                        <option value="perdida">Perdida</option>
                      </select>
                      <button className="btn-icon" title="Duplicar" onClick={() => handleDuplicar(c)}>⎘</button>
                      <button className="btn-print" onClick={() => handleExportPdf(c)}>Exportar PDF</button>
                      <button className="btn-delete" onClick={() => handleEliminar(c.id)}>✕</button>
                    </div>
                  </div>
                  <div className="quote-body">
                    <div className="quote-stat">
                      <span>Valor c/desc.</span>
                      <strong>{formatUF(c.valorConDescuento)}</strong>
                    </div>
                    <div className="quote-stat">
                      <span>Pie</span>
                      <strong>{c.piePorc ? `${c.piePorc}%` : '—'}</strong>
                    </div>
                    <div className="quote-stat">
                      <span>Cuotas</span>
                      <strong>{c.cuotas} meses{c.carencia ? ` + ${c.carencia} car.` : ''}</strong>
                    </div>
                    <div className="quote-stat">
                      <span>Cuota mensual</span>
                      <strong>
                        {c.cuotaMensual !== null ? formatUF(c.cuotaMensual) : <em className="pending">Pendiente</em>}
                      </strong>
                    </div>
                    {c.comision && (
                      <div className="quote-stat">
                        <span>Comisión</span>
                        <strong className="commission-value">{c.comision.porcentaje}% · {formatUF(c.comision.uf)}</strong>
                      </div>
                    )}
                    {c.clasificacion && (
                      <div className="quote-stat">
                        <span>Clasificación</span>
                        <strong>Clas. {c.clasificacion}</strong>
                      </div>
                    )}
                  </div>
                  <div className="quote-nota-row">
                    <textarea
                      className="quote-nota"
                      placeholder="Agregar nota…"
                      value={c.nota || ''}
                      onChange={e => handleNota(c.id, e.target.value)}
                      rows={1}
                    />
                  </div>
                </div>
              ))
            })()}
          </div>
        </main>
      )}

      {tab === 'clientes' && (
        <ClientesView onCotizacionDeleted={() => getCotizaciones().then(setCotizaciones).catch(console.error)} />
      )}

      {tab === 'planes' && <PlansView />}

      {tab === 'resumen' && <ResumenView cotizaciones={cotizaciones} ufValue={ufValue} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
