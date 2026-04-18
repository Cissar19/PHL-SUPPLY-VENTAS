import { useState, useEffect, useRef, useMemo } from 'react'

export function AnimatedNumber({ value, decimals = 2, prefix = '', suffix = '', duration = 450 }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const startRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    const to = value ?? 0
    if (from === to) return
    startRef.current = performance.now()
    cancelAnimationFrame(rafRef.current)
    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  const formatted = useMemo(() => {
    if (!isFinite(display)) return '—'
    return display.toLocaleString('es-CL', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }, [display, decimals])

  return <span>{prefix}{formatted}{suffix}</span>
}

export function Field({ label, hint, error, children, span = 1 }) {
  return (
    <div className="field" style={{ gridColumn: `span ${span}` }}>
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export function TextInput({ value, onChange, placeholder, type = 'text', prefix, suffix, align = 'left', readOnly, min, max, step, ...rest }) {
  return (
    <div className={`input-wrap ${prefix ? 'has-prefix' : ''} ${suffix ? 'has-suffix' : ''}`}>
      {prefix && <span className="input-affix input-prefix">{prefix}</span>}
      <input
        className="input"
        type={type}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        style={{ textAlign: align }}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        {...rest}
      />
      {suffix && <span className="input-affix input-suffix">{suffix}</span>}
    </div>
  )
}

export function FieldSelect({ value, onChange, options, placeholder = 'Seleccionar' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => String(o.value) === String(value))

  return (
    <div className={`select ${open ? 'is-open' : ''}`} ref={ref}>
      <button
        type="button"
        className="select-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className={selected ? '' : 'placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="chev">
          <path d="M3 5.5 L7 9 L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="select-menu" role="listbox">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              className={`select-option ${String(o.value) === String(value) ? 'is-selected' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false) }}
            >
              <span>{o.label}</span>
              {String(o.value) === String(value) && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7.5 L5.5 10.5 L11.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function Slider({ value, onChange, min = 0, max = 100, step = 1, marks = [] }) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100
  return (
    <div className="slider">
      <div className="slider-track">
        <div className="slider-fill" style={{ width: `${pct}%` }} />
        {marks.map(m => {
          const p = max === min ? 0 : ((m - min) / (max - min)) * 100
          return <div key={m} className="slider-mark" style={{ left: `${p}%` }} />
        })}
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="slider-input"
      />
    </div>
  )
}

export function Stepper({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="stepper">
      <button type="button" className="step-btn" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Disminuir">−</button>
      <span className="step-value">{value}</span>
      <button type="button" className="step-btn" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Aumentar">+</button>
    </div>
  )
}
