import { useEffect, useState } from 'react'
import api from '../api/axios'
import '../styles/touristlist.css'

const TABS = ['all', 'active', 'alert', 'departed']
const initials = (name) =>
  name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

export default function TouristList() {
  const [tourists, setTourists] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')

  useEffect(() => {
    api.get('/api/police/tourists')
      .then(({ data }) => setTourists(data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = tourists.filter(t => {
    const matchTab = tab === 'all' || t.status === tab
    const q = search.toLowerCase()
    const matchSearch =
      t.name?.toLowerCase().includes(q) ||
      t.nationality?.toLowerCase().includes(q) ||
      t.place?.toLowerCase().includes(q) ||
      t.touristId?.toLowerCase().includes(q) ||
      t.hotelId?.name?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  const counts = {
    all: tourists.length,
    active: tourists.filter(t => t.status === 'active').length,
    alert: tourists.filter(t => t.status === 'alert').length,
    departed: tourists.filter(t => t.status === 'departed').length,
  }

  if (loading) return <div style={{ padding: 40, color: '#94a3b8' }}>Loading...</div>

  return (
    <div className="tl-page">
      <div className="tl-header">
        <div>
          <h1 className="tl-title">All Tourists</h1>
          <p className="tl-subtitle">Every tourist registered across all hotels</p>
        </div>
        <div className="tl-count">{filtered.length} tourists</div>
      </div>

      <div className="tl-controls">
        <input className="tl-search"
          placeholder="Search by name, hotel, destination, ID..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="tl-tabs">
          {TABS.map(t => (
            <button key={t}
              className={`tl-tab ${tab === t ? 'tl-tab-active' : ''}`}
              onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className={`tl-tab-count tl-tab-count-${t}`}>{counts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tl-table-wrap">
        {filtered.length === 0 ? (
          <div className="tl-empty">No tourists match your search</div>
        ) : (
          <table className="tl-table">
            <thead>
              <tr>
                <th>Tourist</th>
                <th>ID</th>
                <th>Hotel</th>
                <th>Phone</th>
                <th>Destination</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t._id} className="tl-row">
                  <td>
                    <div className="tl-tourist-cell">
                      <div className={`tl-avatar tl-avatar-${t.status}`}>
                        {initials(t.name)}
                      </div>
                      <div>
                        <p className="tl-name">{t.name}</p>
                        <span className="tl-nationality">{t.nationality}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="tl-id">{t.touristId}</span></td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>
                    {t.hotelId?.name || '—'}
                  </td>
                  <td className="tl-phone">{t.phone}</td>
                  <td>{t.place}</td>
                  <td>{t.checkOut}</td>
                  <td>
                    <span className={`tl-status tl-status-${t.status}`}>
                      {t.status === 'alert' ? 'SOS Alert'
                        : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}