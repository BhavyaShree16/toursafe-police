import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [officer, setOfficer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('policeToken')
    const saved = localStorage.getItem('officer')
    if (token && saved) setOfficer(JSON.parse(saved))
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/api/police/login', { email, password })
    localStorage.setItem('policeToken', data.token)
    localStorage.setItem('officer', JSON.stringify(data.officer))
    setOfficer(data.officer)
    return data
  }

  const logout = () => {
    localStorage.removeItem('policeToken')
    localStorage.removeItem('officer')
    setOfficer(null)
  }

  return (
    <AuthContext.Provider value={{ officer, login, logout, loading, isLoggedIn: !!officer }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)