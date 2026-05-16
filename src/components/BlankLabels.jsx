import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

function BlankLabel({ id }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, `SCANNER:${id}`, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }, [id])

  return (
    <div className="print-label blank-label" id={`blank-${id}`}>
      <canvas ref={canvasRef} className="print-qr" />
      <div className="print-details">
        <div className="print-barcode">Unassigned</div>
        <div className="print-field" style={{ fontFamily: 'monospace', fontSize: 9 }}>
          {id.slice(0, 8)}…
        </div>
      </div>
    </div>
  )
}

export function BlankLabels({ onClose }) {
  const [count, setCount] = useState(4)
  const [ids, setIds] = useState([])

  function generate() {
    setIds(Array.from({ length: count }, () => crypto.randomUUID()))
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal blank-labels-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 500 }}>Pre-print blank labels</span>
          <button className="btn-delete" onClick={onClose}>&#x2715;</button>
        </div>

        <p className="blank-labels-hint">
          Stick these on empty boxes. Scan a label later to assign it to an incoming item.
        </p>

        <div className="blank-labels-controls">
          <label>How many?</label>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={e => setCount(Math.max(1, Math.min(20, Number(e.target.value))))}
            className="label-input"
            style={{ width: 70 }}
          />
          <button className="btn btn-secondary" onClick={generate}>
            Generate
          </button>
        </div>

        {ids.length > 0 && (
          <div className="blank-labels-preview" id="print-blank-labels">
            {ids.map(id => <BlankLabel key={id} id={id} />)}
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {ids.length > 0 && (
            <button className="btn btn-primary" onClick={handlePrint}>Print {ids.length} labels</button>
          )}
        </div>
      </div>
    </div>
  )
}
