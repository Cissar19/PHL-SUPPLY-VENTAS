import './PrintView.css'

function fmt(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `UF ${Number(value).toLocaleString('es-CL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
}

function fmtClp(uf, ufValue) {
  if (!uf || !ufValue) return null
  return `$${Math.round(Number(uf) * ufValue).toLocaleString('es-CL')}`
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function PrintView({ cot: c, ufValue }) {
  return (
    <div className="print-overlay">
      <div className="print-page">
        <div className="print-header">
          <div>
            <h1 className="print-empresa">Nuestros Parques</h1>
            <p className="print-subtitulo">Cotización de Servicios</p>
          </div>
          <div className="print-fecha">
            <span>Fecha:</span> {fmtDate(c.fecha)}
            {ufValue && <div className="print-uf-ref">UF del día: ${ufValue.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
          </div>
        </div>

        <section className="print-section">
          <h2>Cliente</h2>
          <table className="print-table">
            <tbody>
              {c.nombre && <tr><td>Nombre completo</td><td>{c.nombre}</td></tr>}
              {c.rut && <tr><td>RUT</td><td>{c.rut}</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>Producto</h2>
          <table className="print-table">
            <tbody>
              {c.productoNombre && <tr><td>Producto</td><td>{c.productoNombre}</td></tr>}
              {c.parqueNombre && <tr><td>Parque</td><td>{c.parqueNombre}</td></tr>}
              {c.capacidad && <tr><td>Capacidad</td><td>{c.capacidad}</td></tr>}
              {c.clasificacion && <tr><td>Clasificación</td><td>Clas. {c.clasificacion}</td></tr>}
              {c.numSepulturas > 1 && <tr><td>N° sepulturas</td><td>{c.numSepulturas}</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>Financiamiento</h2>
          <table className="print-table">
            <tbody>
              <tr><td>Valor</td><td>{fmt(c.valorSepultura)}</td></tr>
              {c.descuento > 0 && <tr><td>Descuento</td><td>{c.descuento}%</td></tr>}
              <tr className="print-row-highlight">
                <td>Valor con descuento</td>
                <td>
                  <strong>{fmt(c.valorConDescuento)}</strong>
                  {ufValue && c.valorConDescuento && <span className="print-clp"> ({fmtClp(c.valorConDescuento, ufValue)})</span>}
                </td>
              </tr>
              {c.piePorc > 0 && <tr><td>Pie</td><td>{c.piePorc}% · {fmt(c.pieUF)}{ufValue && c.pieUF && <span className="print-clp"> ({fmtClp(c.pieUF, ufValue)})</span>}</td></tr>}
              {c.saldoSepultura > 0 && <tr><td>Saldo financiado</td><td>{fmt(c.saldoSepultura)}</td></tr>}
              {c.cuotas && <tr><td>Cuotas</td><td>{c.cuotas} meses{c.carencia ? ` + ${c.carencia} meses de carencia` : ''}</td></tr>}
              {c.cuotaMensual != null && (
                <tr className="print-row-highlight">
                  <td>Cuota mensual</td>
                  <td>
                    <strong>{fmt(c.cuotaMensual)}</strong>
                    {ufValue && c.cuotaMensual && <span className="print-clp"> ({fmtClp(c.cuotaMensual, ufValue)})</span>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {c.comision && (
          <section className="print-section">
            <h2>Comisión</h2>
            <table className="print-table">
              <tbody>
                <tr><td>Comisión</td><td><strong>{c.comision.porcentaje}% · {fmt(c.comision.uf)}</strong></td></tr>
                {c.comision.activacionFNP && (
                  <tr><td>Activación FNP</td><td>{c.comision.activacionFNP.porcentaje}% · {fmt(c.comision.activacionFNP.uf)}</td></tr>
                )}
                {c.comision.premios?.map(p => (
                  <tr key={p.cuota}><td>Premio cuota {p.cuota}</td><td>{p.porc}% · {fmt(p.uf)}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {c.nota && (
          <section className="print-section">
            <h2>Notas</h2>
            <p className="print-nota">{c.nota}</p>
          </section>
        )}

        <div className="print-footer">
          Este documento es una cotización referencial. Los valores en UF se actualizan diariamente.
        </div>
      </div>
    </div>
  )
}
