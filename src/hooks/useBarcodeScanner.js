import { useEffect, useRef, useCallback } from 'react'

// Handheld scanners send characters very quickly then fire Enter.
// We treat a burst of characters (each within CHAR_TIMEOUT ms of the previous)
// ending with Enter as a single barcode scan.
const CHAR_TIMEOUT = 50

export function useBarcodeScanner(onScan) {
  const bufferRef = useRef('')
  const timerRef = useRef(null)

  const flush = useCallback(() => {
    const barcode = bufferRef.current.trim()
    if (barcode.length > 0) onScan(barcode)
    bufferRef.current = ''
  }, [onScan])

  useEffect(() => {
    function handleKeyDown(e) {
      // Ignore if the user is typing in an input or textarea
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'Enter') {
        clearTimeout(timerRef.current)
        flush()
        return
      }

      // Only accumulate printable single characters
      if (e.key.length !== 1) return

      bufferRef.current += e.key

      // Reset the timeout — if no more chars arrive, flush anyway
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flush, CHAR_TIMEOUT * 10)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timerRef.current)
    }
  }, [flush])
}
