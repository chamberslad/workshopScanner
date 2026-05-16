import { useState, useCallback, useRef } from 'react'
import { useInventory } from './hooks/useInventory'
import { useBarcodeScanner } from './hooks/useBarcodeScanner'
import { ScanFeed } from './components/ScanFeed'
import { ScanModal } from './components/ScanModal'
import { CameraScanner } from './components/CameraScanner'
import { PrintLabel } from './components/PrintLabel'
import { NewLabelModal } from './components/NewLabelModal'

export default function App() {
  const { entries, loading, error, addEntry, hasEntry, updateEntry, deleteEntry, clearAll, exportCsv } = useInventory()
  const [lastScan, setLastScan] = useState(null)
  const [pendingId, setPendingId] = useState(null)
  const [pendingBarcode, setPendingBarcode] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [printEntry, setPrintEntry] = useState(null)
  const [highlightId, setHighlightId] = useState(null)
  const [newLabelOpen, setNewLabelOpen] = useState(false)
  const [manualValue, setManualValue] = useState('')
  const manualInputRef = useRef(null)

  const handleScan = useCallback((raw) => {
    // Recognise our own QR labels
    if (raw.startsWith('SCANNER:')) {
      const id = raw.slice('SCANNER:'.length)
      if (hasEntry(id)) {
        // Already assigned — highlight the row
        setHighlightId(id)
        setTimeout(() => setHighlightId(null), 3000)
        document.getElementById(`row-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        // Pre-printed blank label — create the entry now and open details form
        const entry = addEntry('', id)
        setPendingId(entry.id)
        setPendingBarcode('(box label)')
      }
      return
    }
    const entry = addEntry(raw)
    setLastScan(raw)
    setTimeout(() => setLastScan(null), 2000)
    setPendingId(entry.id)
    setPendingBarcode(raw)
  }, [addEntry])

  useBarcodeScanner(handleScan)

  function handleNewLabelSave(fields) {
    const entry = addEntry('', crypto.randomUUID(), fields)
    setNewLabelOpen(false)
    setPrintEntry(entry)
  }

  function handleModalSave(fields) {
    updateEntry(pendingId, fields)
    setPendingId(null)
    setPendingBarcode(null)
  }

  function handleModalSkip() {
    setPendingId(null)
    setPendingBarcode(null)
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    const value = manualValue.trim()
    if (value) {
      handleScan(value)
      setManualValue('')
      manualInputRef.current?.focus()
    }
  }

  function handleClear() {
    if (confirmClear) {
      clearAll()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  if (loading) return <div className="loading">Connecting to database…</div>

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}
      <header className="app-header">
        <div className="header-left">
          <h1>Inventory Scanner</h1>
          <span className="entry-count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setNewLabelOpen(true)}
          >
            New box label
          </button>
          <button
            className={`btn ${cameraOpen ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCameraOpen(o => !o)}
          >
            {cameraOpen ? 'Close camera' : 'Use camera'}
          </button>
          {entries.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={exportCsv}>
                Export CSV
              </button>
              <button
                className={`btn ${confirmClear ? 'btn-danger' : 'btn-secondary'}`}
                onClick={handleClear}
              >
                {confirmClear ? 'Confirm clear?' : 'Clear all'}
              </button>
            </>
          )}
        </div>
      </header>

      <div className={`scan-indicator ${lastScan ? 'scan-indicator--visible' : ''}`}>
        Scanned: <strong>{lastScan}</strong>
      </div>

      <div className="manual-bar">
        <form onSubmit={handleManualSubmit} className="manual-form">
          <label htmlFor="manual-input" className="manual-label">Simulate scan</label>
          <input
            id="manual-input"
            ref={manualInputRef}
            type="text"
            className="manual-input"
            placeholder="Type a barcode and press Enter"
            value={manualValue}
            onChange={e => setManualValue(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-secondary" disabled={!manualValue.trim()}>
            Scan
          </button>
        </form>
      </div>

      <main className="app-main">
        <ScanFeed
          entries={entries}
          onUpdateEntry={updateEntry}
          onDelete={deleteEntry}
          onPrint={setPrintEntry}
          highlightId={highlightId}
        />
      </main>

      {pendingBarcode && (
        <ScanModal
          barcode={pendingBarcode}
          onSave={handleModalSave}
          onSkip={handleModalSkip}
        />
      )}

      {cameraOpen && (
        <CameraScanner
          onScan={handleScan}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {printEntry && (
        <PrintLabel
          entry={printEntry}
          onClose={() => setPrintEntry(null)}
        />
      )}

      {newLabelOpen && (
        <NewLabelModal
          onSave={handleNewLabelSave}
          onClose={() => setNewLabelOpen(false)}
        />
      )}
    </div>
  )
}
