import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { LogoFull } from './Logo'

const NAV = {
  farmer: [
    { to: '/farmer',              icon: '📊', label: 'Dashboard'       },
    { to: '/farmer/register',     icon: '➕', label: 'Register Batch'  },
    { to: '/farmer/batches',      icon: '📦', label: 'My Batches'      },
    { to: '/farmer/listings',     icon: '🏷',  label: 'My Listings'    },
    { to: '/marketplace',         icon: '🛒', label: 'Marketplace'     },
  ],
  agent: [
    { to: '/agent',               icon: '📊', label: 'Dashboard'       },
    { to: '/agent/verify',        icon: '🔍', label: 'Verify Queue'    },
  ],
  buyer: [
    { to: '/marketplace',         icon: '🛒', label: 'Marketplace'     },
    { to: '/buyer/orders',        icon: '📋', label: 'My Orders'       },
    { to: '/buyer/verify',        icon: '🔍', label: 'Verify a Batch'  },
  ],
  ministry: [
    { to: '/ministry',            icon: '📊', label: 'Dashboard'       },
    { to: '/ministry/ledger',     icon: '⛓',  label: 'Full Ledger'    },
    { to: '/ministry/reports',    icon: '📜', label: 'Reports & Certs' },
  ],
}

const ROLE_COLORS = {
  farmer: '#2E75B6', agent: '#059669', buyer: '#7C3AED', ministry: '#D97706',
}

export default function Layout({ children, title }) {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const navItems = NAV[user?.role] || []

  function handleLogout() {
    logout()
    navigate('/')
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <LogoFull />
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Navigation</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/farmer' || item.to === '/agent' || item.to === '/ministry'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="user-pill">
            <div className="user-avatar" style={{ background: ROLE_COLORS[user?.role] }}>
              {initials}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 4 }}>
            <span className="nav-icon">↩</span> Log Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-actions">
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-LS', { dateStyle: 'medium' })}
            </span>
          </div>
        </div>
        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}
