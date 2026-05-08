import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import api from '../api/axios'
import '../styles/alerts.css'

const initials = (name) =>
  name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [resolving, setResolving] = useState(null)
  const [generatingEFIR, setGeneratingEFIR] = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    api.get('/api/police/alerts').then(({ data }) => setAlerts(data))

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:4000')

    socketRef.current.on('sos:new', (tourist) => {
      setAlerts(prev => {
        const exists = prev.find(a => a._id === tourist._id)
        if (exists) return prev
        return [tourist, ...prev]
      })
    })

    socketRef.current.on('alert:resolved', ({ id }) => {
      setAlerts(prev => prev.filter(a => a._id !== id))
    })

    return () => socketRef.current?.disconnect()
  }, [])

  const handleResolve = async (id) => {
    setResolving(id)
    try {
      await api.patch(`/api/police/tourists/${id}/resolve`)
      setAlerts(prev => prev.filter(a => a._id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setResolving(null)
    }
  }

  const handleGenerateEFIR = async (t) => {
    setGeneratingEFIR(t._id)
    try {
      const { data } = await api.post(`/api/police/efir/${t._id}`)
      
      // Download as text file
      const blob = new Blob([data.efir], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `eFIR_${t.touristId}_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Failed to generate e-FIR')
    } finally {
      setGeneratingEFIR(null)
    }
  }

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div>
          <h1 className="alerts-title">Active Alerts</h1>
          <p className="alerts-subtitle">
            {alerts.length === 0
              ? 'No active SOS alerts right now'
              : `${alerts.length} alert${alerts.length > 1 ? 's' : ''} need attention`}
          </p>
        </div>
        <div className="alerts-live">
          <div className="alerts-live-dot" />
          Live feed
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="alerts-empty">
          <div className="alerts-empty-icon">✅</div>
          <p>All clear — no active SOS alerts</p>
        </div>
      ) : (
        alerts.map(t => (
          <div key={t._id} className="alert-card">
            <div className="alert-card-header">
              <div className="alert-card-left">
                <div className="alert-avatar">{initials(t.name)}</div>
                <div>
                  <p className="alert-name">{t.name}</p>
                  <span className="alert-time">
                    {t.nationality} · {t.hotelId?.name || 'Unknown hotel'}
                  </span>
                </div>
              </div>
              <div className="alert-sos-badge">
                <div className="alert-sos-dot" />
                SOS Active
              </div>
            </div>

            <div className="alert-card-details">
              <div className="alert-detail">
                <p className="alert-detail-label">District</p>
                <p className="alert-detail-value">{t.district || t.place}</p>
              </div>
              <div className="alert-detail">
                <p className="alert-detail-label">Destination</p>
                <p className="alert-detail-value">{t.place}</p>
              </div>
              <div className="alert-detail">
                <p className="alert-detail-label">Phone</p>
                <p className="alert-detail-value">{t.phone}</p>
              </div>
              <div className="alert-detail">
                <p className="alert-detail-label">Emergency Contact</p>
                <p className="alert-detail-value">{t.emergencyName} · {t.emergencyPhone}</p>
              </div>
              <div className="alert-detail">
                <p className="alert-detail-label">Hotel</p>
                <p className="alert-detail-value">{t.hotelId?.name || '—'}</p>
              </div>
              <div className="alert-detail">
                <p className="alert-detail-label">Tourist ID</p>
                <p className="alert-detail-value">{t.touristId}</p>
              </div>
            </div>

            <div className="alert-card-actions">
              <button
                className="alert-btn-resolve"
                onClick={() => handleResolve(t._id)}
                disabled={resolving === t._id}
              >
                {resolving === t._id ? 'Resolving...' : 'Mark Resolved'}
              </button>
              <button
                className="alert-btn-efir"
                onClick={() => handleGenerateEFIR(t)}
                disabled={generatingEFIR === t._id}
              >
                {generatingEFIR === t._id ? 'Generating...' : 'Generate e-FIR'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}