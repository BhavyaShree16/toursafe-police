import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import MapView from './pages/MapView'
import Alerts from './pages/Alerts'
import TouristList from './pages/TouristList'

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <div style={{ padding: 40, color: '#94a3b8' }}>Loading...</div>
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isLoggedIn } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={
        isLoggedIn ? <Navigate to="/map" replace /> : <Login />
      } />
      <Route path="/" element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="/map" replace />} />
        <Route path="map" element={<MapView />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="tourists" element={<TouristList />} />
      </Route>
      <Route path="*" element={<Navigate to="/map" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}