import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import logoSrc from '../assets/logo.png'

const NAV_ITEMS = [
  { section: 'MAIN' },
  { key: '/dashboard', label: 'Dashboard',  icon: '📊' },
  { key: '/leads',     label: 'Leads',       icon: '👥', badge: 'leads' },
  { key: '/tasks',     label: 'Tasks',       icon: '✅', badge: 'tasks' },

  { section: 'WORK' },
  { key: '/projects',  label: 'Projects',    icon: '📁' },
  { key: '/targets',   label: 'Targets',     icon: '🎯', managerOnly: true },
  { key: '/reports',   label: 'Reports',     icon: '📈', managerOnly: true },

  { section: 'CATALOG' },
  { key: '/products',  label: 'Products',    icon: '📦', managerOnly: true },
  { key: '/invoices',  label: 'Invoices',    icon: '🧾', managerOnly: true },

  { section: 'ADMIN' },
  { key: '/users',     label: 'Users',       icon: '👤', adminOnly: true },

  { section: 'ACCOUNT' },
  { key: '/profile',   label: 'My Profile',  icon: '🪪' },
  { key: '/settings',  label: 'Settings',    icon: '⚙️' },
]

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const navigate             = useNavigate()
  const location             = useLocation()
  const { user, logout }     = useAuth()
  const { leads, tasks }     = useApp()

  const isAdmin   = user?.role === 'ADMIN'
  const isManager = user?.role === 'MANAGER' || isAdmin

  const badgeValues = {
    leads: leads.filter(l =>
      l.status === 'NEW' && (isManager ? true : l.agent === user?.name)
    ).length,
    tasks: tasks.filter(t =>
      t.status === 'PENDING' && (isManager ? true : t.agent === user?.name)
    ).length,
  }

  const roleLabel = {
    ADMIN:       '🔴 Admin',
    MANAGER:     '🟠 Manager',
    SALES_AGENT: '🟢 Sales Agent',
  }[user?.role] ?? user?.role

  const avatarBg = isAdmin
    ? 'linear-gradient(135deg,#e53e3e,#c53030)'
    : isManager
      ? 'linear-gradient(135deg,#E8701A,#c05a10)'
      : 'linear-gradient(135deg,var(--teal),var(--teal-dark))'

  const handleLogout = () => {
    if (onClose) onClose()
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  const handleNav = (key) => {
    if (onClose) onClose()
    navigate(key)
  }

  const renderNavItems = () =>
    NAV_ITEMS.map((item, i) => {
      if (item.section) {
        if (item.section === 'ADMIN' && !isAdmin) return null
        return collapsed ? null : (
          <div key={i} className="nav-section">{item.section}</div>
        )
      }

      if (item.adminOnly   && !isAdmin)   return null
      if (item.managerOnly && !isManager) return null

      const isActive =
        location.pathname === item.key ||
        (item.key !== '/dashboard' && location.pathname.startsWith(item.key))

      const badgeCount = item.badge ? badgeValues[item.badge] : 0

      return (
        <div
          key={item.key}
          className={`nav-item ${isActive ? 'active' : ''}`}
          onClick={() => handleNav(item.key)}
          title={collapsed ? item.label : ''}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <span className="nav-icon">{item.icon}</span>
          {!collapsed && (
            <>
              <span className="nav-label">{item.label}</span>
              {badgeCount > 0 && (
                <span className="nav-badge">{badgeCount}</span>
              )}
            </>
          )}
        </div>
      )
    })

  return (
    <>
      {/* ═══════════════════════════════════
          DESKTOP SIDEBAR
      ═══════════════════════════════════ */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

        <div className="sidebar-logo">
          <img src={logoSrc} alt="Kavya Infoweb" />
          {!collapsed && (
            <div className="sidebar-logo-text">
              <strong>Kavya Infoweb</strong>
              <span>Your business is our success</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {renderNavItems()}
        </nav>

        <div className="sidebar-footer">
          <div className="user-tile" onClick={() => navigate('/profile')}>
            <div className="avatar avatar-md" style={{ background: avatarBg }}>
              {user?.initials || '?'}
            </div>
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">{roleLabel}</div>
              </div>
            )}
          </div>
          <div className="nav-item danger" onClick={handleLogout} style={{ marginTop: 4 }}>
            <span className="nav-icon">🚪</span>
            {!collapsed && <span className="nav-label">Logout</span>}
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════
          MOBILE DRAWER
      ═══════════════════════════════════ */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-drawer"
          style={{
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            width: 272,
            background: '#fff',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '6px 0 32px rgba(0,0,0,0.18)',
            animation: 'sidebarSlideIn .22s ease',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* ── Logo bar ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'linear-gradient(135deg,#e6fafb,#f8ffff)',
            borderBottom: '1.5px solid var(--border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <img
                src={logoSrc}
                alt="Kavya Infoweb"
                style={{
                  width: 36, height: 36,
                  objectFit: 'contain',
                  borderRadius: 8,
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontWeight: 800, fontSize: 13.5, color: 'var(--text1)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  Kavya Infoweb
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text3)', marginTop: 1 }}>
                  Your business is our success
                </div>
              </div>
            </div>

            {/* Close ✕ */}
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', fontSize: 20,
                cursor: 'pointer', color: 'var(--text2)',
                padding: '4px 6px', flexShrink: 0,
                lineHeight: 1,
                WebkitTapHighlightColor: 'transparent',
              }}
            >✕</button>
          </div>

          {/* ── User card ── */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12,
            flexShrink: 0,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: avatarBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
            }}>
              {user?.initials || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 700, fontSize: 13.5, color: 'var(--text1)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                {roleLabel}
              </div>
            </div>
          </div>

          {/* ── Nav links ── */}
          <nav style={{ flex: 1, padding: '8px 0' }}>
            {NAV_ITEMS.map((item, i) => {
              if (item.section) {
                if (item.section === 'ADMIN' && !isAdmin) return null
                return (
                  <div key={i} style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: 2,
                    textTransform: 'uppercase', color: 'var(--text3)',
                    padding: '14px 20px 5px',
                  }}>
                    {item.section}
                  </div>
                )
              }

              if (item.adminOnly   && !isAdmin)   return null
              if (item.managerOnly && !isManager) return null

              const isActive =
                location.pathname === item.key ||
                (item.key !== '/dashboard' && location.pathname.startsWith(item.key))

              const badgeCount = item.badge ? badgeValues[item.badge] : 0

              return (
                <div
                  key={item.key}
                  onClick={() => handleNav(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 13,
                    padding: '12px 20px',
                    cursor: 'pointer',
                    background: isActive ? '#e6fafb' : 'transparent',
                    borderLeft: isActive
                      ? '3px solid var(--teal,#1AABB0)'
                      : '3px solid transparent',
                    color: isActive ? 'var(--teal,#1AABB0)' : 'var(--text1)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14,
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: 19, width: 24, textAlign: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {badgeCount > 0 && (
                    <span style={{
                      background: 'var(--orange,#E8701A)', color: '#fff',
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 7px', borderRadius: 20,
                    }}>
                      {badgeCount}
                    </span>
                  )}
                </div>
              )
            })}
          </nav>

          {/* ── Logout ── */}
          <div style={{ borderTop: '1.5px solid var(--border)', flexShrink: 0 }}>
            <div
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 13,
                padding: '14px 20px',
                cursor: 'pointer',
                color: '#e53e3e', fontWeight: 600, fontSize: 14,
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
              }}
            >
              <span style={{ fontSize: 19, width: 24, textAlign: 'center' }}>🚪</span>
              Logout
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 998,
          }}
        />
      )}

      <style>{`
        @keyframes sidebarSlideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}