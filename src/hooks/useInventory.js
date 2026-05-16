import { useState, useEffect, useCallback } from 'react'
import { useMsal } from '@azure/msal-react'
import { tokenRequest } from '../auth/msalConfig'

export function useInventory() {
  const { instance, accounts } = useMsal()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const authFetch = useCallback(async (url, options = {}) => {
    let result
    try {
      result = await instance.acquireTokenSilent({ ...tokenRequest, account: accounts[0] })
    } catch {
      await instance.acquireTokenRedirect({ ...tokenRequest, account: accounts[0] })
      return
    }
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${result.idToken}`,
      },
    })
  }, [instance, accounts])

  useEffect(() => {
    authFetch('/api/entries')
      .then(r => r.json())
      .then(data => { setEntries(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [authFetch])

  async function addEntry(barcode, id = crypto.randomUUID(), extraFields = {}) {
    const entry = { id, barcode, customer: '', address: '', make: '', model: '', ...extraFields, scannedAt: new Date().toISOString() }
    setEntries(prev => [entry, ...prev])
    try {
      const res = await authFetch('/api/entries', {
        method: 'POST',
        body: JSON.stringify(entry),
      })
      const saved = await res.json()
      setEntries(prev => prev.map(e => e.id === id ? saved : e))
      return saved
    } catch (e) {
      setEntries(prev => prev.filter(e => e.id !== id))
      setError(e.message)
      return entry
    }
  }

  function hasEntry(id) {
    return entries.some(e => e.id === id)
  }

  async function updateEntry(id, fields) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...fields } : e))
    try {
      await authFetch(`/api/entries/${id}`, { method: 'PATCH', body: JSON.stringify(fields) })
    } catch (e) {
      setError(e.message)
    }
  }

  async function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
    try {
      await authFetch(`/api/entries/${id}`, { method: 'DELETE' })
    } catch (e) {
      setError(e.message)
    }
  }

  async function clearAll() {
    setEntries([])
    try {
      await authFetch('/api/entries', { method: 'DELETE' })
    } catch (e) {
      setError(e.message)
    }
  }

  function exportCsv() {
    const header = 'Barcode,Customer,Address,Make,Model,Scanned At'
    const csv = v => `"${String(v).replace(/"/g, '""')}"`
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

  return { entries, loading, error, addEntry, hasEntry, updateEntry, deleteEntry, clearAll, exportCsv }
}
