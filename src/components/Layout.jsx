import Sidebar from './Sidebar'
import { Outlet, useLocation } from 'react-router-dom'
import '../styles/layout.css'

export default function Layout() {
  const { pathname } = useLocation()
  const isMap = pathname === '/map'

  return (
    <div className="layout-root">
      <Sidebar />
      <div className="layout-body">
        <main className={isMap ? 'main-fullscreen' : 'main'}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}