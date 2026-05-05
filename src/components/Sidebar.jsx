import { NavLink } from 'react-router-dom'
import '../styles/sidebar.css'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🛡️</div>
          <div>
            <p className="sidebar-logo-title">TourSafe</p>
            <p className="sidebar-logo-sub">Police Dashboard</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/map" className={({ isActive }) =>
            isActive ? 'sidebar-item active' : 'sidebar-item'}>
            <span className="sidebar-item-icon">🗺️</span>
            Live Map
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) =>
            isActive ? 'sidebar-item active' : 'sidebar-item'}>
            <span className="sidebar-item-icon">🚨</span>
            Alerts
          </NavLink>
          <NavLink to="/tourists" className={({ isActive }) =>
            isActive ? 'sidebar-item active' : 'sidebar-item'}>
            <span className="sidebar-item-icon">👥</span>
            All Tourists
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-live">
          <div className="sidebar-live-dot" />
          System live
        </div>
      </div>
    </aside>
  )
}