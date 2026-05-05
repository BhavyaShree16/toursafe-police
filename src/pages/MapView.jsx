import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import '../styles/map.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// District coordinates — map centers here based on officer's district
const DISTRICT_COORDS = {
  'Chennai':         { lat: 13.0827, lng: 80.2707, zoom: 11 },
  'Coimbatore':      { lat: 11.0168, lng: 76.9558, zoom: 11 },
  'Madurai':         { lat: 9.9252,  lng: 78.1198, zoom: 11 },
  'Tiruchirappalli': { lat: 10.7905, lng: 78.7047, zoom: 11 },
  'Salem':           { lat: 11.6643, lng: 78.1460, zoom: 11 },
  'Tirunelveli':     { lat: 8.7139,  lng: 77.7567, zoom: 11 },
  'Vellore':         { lat: 12.9165, lng: 79.1325, zoom: 11 },
  'Erode':           { lat: 11.3410, lng: 77.7172, zoom: 11 },
  'Nilgiris':        { lat: 11.4102, lng: 76.6950, zoom: 11 },
  'Dindigul':        { lat: 10.3624, lng: 77.9695, zoom: 11 },
  'Thanjavur':       { lat: 10.7870, lng: 79.1378, zoom: 11 },
  'Kanyakumari':     { lat: 8.0883,  lng: 77.5385, zoom: 11 },
  'Pudukottai':      { lat: 10.3833, lng: 78.8001, zoom: 11 },
  'Ramanathapuram':  { lat: 9.3639,  lng: 78.8395, zoom: 11 },
  'Virudhunagar':    { lat: 9.5851,  lng: 77.9629, zoom: 11 },
  'Thoothukudi':     { lat: 8.7642,  lng: 78.1348, zoom: 11 },
  'Nagapattinam':    { lat: 10.7672, lng: 79.8449, zoom: 11 },
  'Cuddalore':       { lat: 11.7447, lng: 79.7689, zoom: 11 },
  'Villupuram':      { lat: 11.9401, lng: 79.4861, zoom: 11 },
  'Krishnagiri':     { lat: 12.5186, lng: 78.2137, zoom: 11 },
  'Dharmapuri':      { lat: 12.1277, lng: 78.1580, zoom: 11 },
  'Namakkal':        { lat: 11.2195, lng: 78.1677, zoom: 11 },
  'Karur':           { lat: 10.9601, lng: 78.0766, zoom: 11 },
  'Perambalur':      { lat: 11.2342, lng: 78.8802, zoom: 11 },
  'Ariyalur':        { lat: 11.1404, lng: 79.0756, zoom: 11 },
  'Sivaganga':       { lat: 9.8477,  lng: 78.4800, zoom: 11 },
  'Theni':           { lat: 10.0105, lng: 77.4770, zoom: 11 },
  'Tiruppur':        { lat: 11.1085, lng: 77.3411, zoom: 11 },
  'Tiruvallur':      { lat: 13.1437, lng: 79.9088, zoom: 11 },
  'Kancheepuram':    { lat: 12.8333, lng: 79.7000, zoom: 11 },
  'Tiruvannamalai':  { lat: 12.2253, lng: 79.0747, zoom: 11 },
  'Kallakurichi':    { lat: 11.7380, lng: 78.9607, zoom: 11 },
  'Ranipet':         { lat: 12.9224, lng: 79.3323, zoom: 11 },
  'Tenkasi':         { lat: 8.9641,  lng: 77.3155, zoom: 11 },
  'Chengalpattu':    { lat: 12.6921, lng: 79.9754, zoom: 11 },
  'Mayiladuthurai':  { lat: 11.1015, lng: 79.6518, zoom: 11 },
}

// Spread tourists slightly within the district so markers don't stack
const scatter = (lat, lng, index) => {
  const spread = 0.05
  const angle = (index * 137.5 * Math.PI) / 180
  return [
    lat + spread * Math.cos(angle) * (index % 3 + 1) / 3,
    lng + spread * Math.sin(angle) * (index % 3 + 1) / 3,
  ]
}

const makeIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:${color};border:2.5px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const ICONS = {
  active:   makeIcon('#22c55e'),
  alert:    makeIcon('#ef4444'),
  departed: makeIcon('#94a3b8'),
}

export default function MapView() {
  const { officer } = useAuth()
  const [tourists, setTourists] = useState([])
  const socketRef = useRef(null)

  const districtInfo = DISTRICT_COORDS[officer?.district] || { lat: 11.1271, lng: 78.6569, zoom: 8 }

  useEffect(() => {
    api.get('/api/police/tourists').then(({ data }) => setTourists(data))

    socketRef.current = io('http://localhost:4000')

    socketRef.current.on('sos:new', (tourist) => {
      if (tourist.district !== officer?.district) return
      setTourists(prev =>
        prev.map(t => t._id === tourist._id ? { ...t, status: 'alert' } : t)
      )
    })

    socketRef.current.on('alert:resolved', ({ id }) => {
      setTourists(prev =>
        prev.map(t => t._id === id ? { ...t, status: 'active' } : t)
      )
    })

    return () => socketRef.current?.disconnect()
  }, [officer])

  const counts = {
    active:   tourists.filter(t => t.status === 'active').length,
    alert:    tourists.filter(t => t.status === 'alert').length,
    departed: tourists.filter(t => t.status === 'departed').length,
  }

  return (
    <div className="map-wrap">
      <div className="map-header">
        <div>
          <span className="map-title">
            {officer?.district} District — Live Tourist Map
          </span>
          <span className="map-station"> · {officer?.stationName}</span>
        </div>
        <div className="map-legend">
          <div className="map-legend-item">
            <div className="map-legend-dot active" />
            Active ({counts.active})
          </div>
          <div className="map-legend-item">
            <div className="map-legend-dot alert" />
            SOS ({counts.alert})
          </div>
          <div className="map-legend-item">
            <div className="map-legend-dot departed" />
            Departed ({counts.departed})
          </div>
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={[districtInfo.lat, districtInfo.lng]}
          zoom={districtInfo.zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          {tourists.map((t, i) => {
            const [lat, lng] = scatter(districtInfo.lat, districtInfo.lng, i)
            return (
              <Marker
                key={t._id}
                position={[lat, lng]}
                icon={ICONS[t.status] || ICONS.active}
              >
                <Popup>
                  <p className="map-popup-name">{t.name}</p>
                  <p className="map-popup-row">📍 {t.place}</p>
                  <p className="map-popup-row">🏨 {t.hotelId?.name || '—'}</p>
                  <p className="map-popup-row">📞 {t.phone}</p>
                  <p className="map-popup-row">🚨 {t.emergencyName} · {t.emergencyPhone}</p>
                  <p className="map-popup-row">🪪 {t.touristId}</p>
                  <span className={`map-popup-status ${t.status}`}>
                    {t.status === 'alert' ? 'SOS Active'
                      : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}