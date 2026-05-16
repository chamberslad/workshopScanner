import { useState } from 'react'

const EDITABLE_FIELDS = [
  { key: 'customer', label: 'Customer' },
  { key: 'address',  label: 'Address' },
  { key: 'make',     label: 'Make' },
  { key: 'model',    label: 'Model' },
]

function EditableCell({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function start() {
    setDraft(value)
    setEditing(true)
  }

  function commit() {
    onSave(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        className="label-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    )
  }

  return (
    <span
      className={`label-text ${!value ? 'label-empty' : ''}`}
      onClick={start}
      title="Click to edit"
    >
      {value || '—'}
    </span>
  )
}

export function ScanFeed({ entries, onUpdateEntry, onDelete, onPrint, highlightId }) {
  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <p>No items scanned yet.</p>
        <p className="hint">Point your scanner at a barcode — this page is always listening.</p>
      </div>
    )
  }

  return (
    <div className="table-scroll">
      <table className="inventory-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Barcode</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Make</th>
            <th>Model</th>
            <th>Time</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr
              key={entry.id}
              id={`row-${entry.id}`}
              className={highlightId === entry.id ? 'row-found' : idx === 0 ? 'row-new' : ''}
            >
              <td className="col-index">{entries.length - idx}</td>
              <td className="col-barcode">{entry.barcode}</td>
              {EDITABLE_FIELDS.map(f => (
                <td key={f.key} className="col-editable">
                  <EditableCell
                    value={entry[f.key]}
                    onSave={val => onUpdateEntry(entry.id, { [f.key]: val })}
                  />
                </td>
              ))}
              <td className="col-time">
                {new Date(entry.scannedAt).toLocaleTimeString()}
              </td>
              <td className="col-actions">
                <button
                  className="btn-print"
                  onClick={() => onPrint(entry)}
                  title="Print QR label"
                >
                  &#x2399;
                </button>
                <button
                  className="btn-delete"
                  onClick={() => onDelete(entry.id)}
                  title="Remove this entry"
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
