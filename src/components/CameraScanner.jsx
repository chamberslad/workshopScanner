import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'

export function CameraScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [error, setError] = useState(null)
  const lastScanRef = useRef('')

  // Start with environment-facing camera; this triggers the permission prompt
  useEffect(() => {
    if (!videoRef.current) return

    const reader = new BrowserMultiFormatReader()

    const constraints = selectedCamera
      ? { video: { deviceId: { exact: selectedCamera } } }
      : { video: { facingMode: { ideal: 'environment' } } }

    reader
      .decodeFromConstraints(constraints, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText()
          if (text !== lastScanRef.current) {
            lastScanRef.current = text
            onScan(text)
            setTimeout(() => { lastScanRef.current = '' }, 1500)
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          console.warn(err)
        }
      })
      .then(controls => {
        controlsRef.current = controls
        // Now that we have permission, enumerate cameras for the switcher
        BrowserMultiFormatReader.listVideoInputDevices()
          .then(devices => { if (devices.length > 1) setCameras(devices) })
          .catch(() => {})
      })
      .catch(e => setError(e.message ?? 'Camera unavailable'))

    return () => {
      controlsRef.current?.stop()
    }
  }, [selectedCamera, onScan])

  return (
    <div className="camera-overlay" onClick={onClose}>
      <div className="camera-modal" onClick={e => e.stopPropagation()}>
        <div className="camera-header">
          <span className="camera-title">Camera scanner</span>
          <button className="btn-delete" onClick={onClose} title="Close">&#x2715;</button>
        </div>

        {error ? (
          <div className="camera-error">{error}</div>
        ) : (
          <>
            <div className="camera-viewfinder">
              <video ref={videoRef} className="camera-video" />
              <div className="camera-aim" />
            </div>

            {cameras.length > 1 && (
              <select
                className="camera-select"
                value={selectedCamera ?? ''}
                onChange={e => setSelectedCamera(e.target.value)}
              >
                {cameras.map(c => (
                  <option key={c.deviceId} value={c.deviceId}>
                    {c.label || `Camera ${c.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            )}

            <p className="camera-hint">Hold a barcode in front of the camera</p>
          </>
        )}
      </div>
    </div>
  )
}
