import { useRef } from 'react'

const FIELDS = [
  { key: 'customer', label: 'Customer', placeholder: 'Customer name' },
  { key: 'make',     label: 'Make',     placeholder: 'e.g. Ford' },
  { key: 'model',    label: 'Model',    placeholder: 'e.g. Transit' },
  { key: 'address',  label: 'Address',  placeholder: 'Delivery / site address (optional)' },
]

export function NewLabelModal({ onSave, onClose }) {
  const formRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(formRef.current))
    onSave(data)
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (idx < FIELDS.length - 1) {
        formRef.current?.elements[FIELDS[idx + 1].key]?.focus()
      } else {
        handleSubmit(e)
      }
    }
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-subtitle">New box label</p>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Fill in details then print a QR to stick on the box</p>
          </div>
          <button className="btn-delete" onClick={onClose}>&#x2715;</button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="modal-fields">
            {FIELDS.map((field, idx) => (
              <div key={field.key} className="modal-field">
                <label htmlFor={`new-${field.key}`}>{field.label}</label>
                <input
                  id={`new-${field.key}`}
                  name={field.key}
                  type="text"
                  placeholder={field.placeholder}
                  autoFocus={idx === 0}
                  autoComplete="off"
                  onKeyDown={e => handleKeyDown(e, idx)}
                />
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Generate &amp; Print</button>
          </div>
        </form>
      </div>
    </div>
  )
}
