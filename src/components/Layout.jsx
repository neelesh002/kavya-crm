import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { ToastContainer } from './UI'
import { useApp } from '../context/AppContext'

// ✅ matchMedia is reliable on Android Chrome
// window.innerWidth can return wrong values due to device pixel ratio
const checkMobile = () => window.matchMedia('(max-width: 768px)').matches

export default function Layout() {
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const { toasts, removeToast } = useApp()

  // When screen resizes back to desktop, close mobile drawer
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e) => { if (!e.matches) setMobileOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Single toggle handler — passed to Header
  const toggle = () => {
    if (checkMobile()) {
      setMobileOpen(o => !o)   // mobile  → open/close drawer
    } else {
      setCollapsed(c => !c)    // desktop → collapse/expand sidebar
    }
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="crm-layout">

      {/* Dark backdrop — tap to close sidebar on mobile */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={closeMobile}
      />

      {/* Sidebar — receives both props */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={closeMobile}
      />

      {/* Main content area */}
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Header onToggle={toggle} />
        <div className="page-container">
          <Outlet />
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}