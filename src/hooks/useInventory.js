import { useState, useEffect } from 'react'

const STORAGE_KEY = 'inventory_entries'

const EMPTY_DETAILS = { customer: '', address: '', make: '', model: '' }

export function useInventory() {
  const [entries, setEntries] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  function addEntry(barcode, id = crypto.randomUUID(), extraFields = {}) {
    const entry = {
      id,
      barcode,
      ...EMPTY_DETAILS,
      ...extraFields,
      scannedAt: new Date().toISOString(),
    }
    setEntries(prev => [entry, ...prev])
    return entry
  }

  function hasEntry(id) {
    return entries.some(e => e.id === id)
  }

  function updateEntry(id, fields) {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, ...fields } : e))
    )
  }

  function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function clearAll() {
    setEntries([])
  }

  function exportCsv() {
    const header = 'Barcode,Customer,Address,Make,Model,Scanned At'
    const csv = (v) => `"${String(v).replace(/"/g, '""')}"`
    const rows = entries.map(e =>
      [e.barcode, csv(e.customer), csv(e.address), csv(e.make), csv(e.model), e.scannedAt].join(',')
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { entries, addEntry, hasEntry, updateEntry, deleteEntry, clearAll, exportCsv }
}
