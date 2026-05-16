import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export function PrintLabel({ entry, onClose }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, `SCANNER:${entry.id}`, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }, [entry.id])

  function handlePrint() {
    window.print()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal print-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 500 }}>Print label</span>
          <button className="btn-delete" onClick={onClose}>&#x2715;</button>
        </div>

        {/* This element is what gets printed */}
        <div className="print-label" id="print-label">
          <canvas ref={canvasRef} className="print-qr" />
          <div className="print-details">
            <div className="print-barcode">{entry.barcode}</div>
            {entry.customer && <div className="print-field">{entry.customer}</div>}
            {entry.make && entry.model && (
              <div className="print-field">{entry.make} {entry.model}</div>
            )}
            {entry.address && <div className="print-field print-address">{entry.address}</div>}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePrint}>Print</button>
        </div>
      </div>
    </div>
  )
}
