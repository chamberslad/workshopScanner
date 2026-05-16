import { useState, useRef, useEffect } from 'react'

const FIELDS = [
  { key: 'customer', label: 'Customer', placeholder: 'Customer name' },
  { key: 'address',  label: 'Address',  placeholder: 'Delivery / site address' },
  { key: 'make',     label: 'Make',     placeholder: 'e.g. Ford' },
  { key: 'model',    label: 'Model',    placeholder: 'e.g. Transit' },
]

export function ScanModal({ barcode, onSave, onSkip }) {
  const [values, setValues] = useState({ customer: '', address: '', make: '', model: '' })
  const firstRef = useRef(null)

  useEffect(() => {
    setValues({ customer: '', address: '', make: '', model: '' })
    firstRef.current?.focus()
  }, [barcode])

  function handleKeyDown(e, idx) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (idx < FIELDS.length - 1) {
        document.getElementById(`field-${FIELDS[idx + 1].key}`)?.focus()
      } else {
        onSave(values)
      }
    }
    if (e.key === 'Escape') onSkip()
  }

  return (
    <div className="modal-overlay" onClick={onSkip}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-subtitle">Scanned</p>
            <p className="modal-barcode">{barcode}</p>
          </div>
          <button className="btn-delete" onClick={onSkip} title="Skip">&#x2715;</button>
        </div>

        <div className="modal-fields">
          {FIELDS.map((field, idx) => (
            <div key={field.key} className="modal-field">
              <label htmlFor={`field-${field.key}`}>{field.label}</label>
              <input
                id={`field-${field.key}`}
                ref={idx === 0 ? firstRef : null}
                type="text"
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                onKeyDown={e => handleKeyDown(e, idx)}
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onSkip}>Skip</button>
          <button className="btn btn-primary" onClick={() => onSave(values)}>Save</button>
        </div>
      </div>
    </div>
  )
}
