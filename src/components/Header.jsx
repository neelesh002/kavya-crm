import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { LEADS_DATA, TASKS_DATA, PROJECTS_DATA } from '../data/sampleData'
 
export default function Header({ onToggle }) {
  const navigate = useNavigate()
  const { unreadCount, notifications, markNotifRead, markAllRead } = useApp()
  const { user } = useAuth()
 
  const [showNotifs,  setShowNotifs]  = useState(false)
  const [searchVal,   setSearchVal]   = useState('')
  const [showResults, setShowResults] = useState(false)
  const [notifPos,    setNotifPos]    = useState({ top: 60, right: 8 })
  const searchRef  = useRef(null)
  const notifBtnRef = useRef(null)
 
  const isAdmin   = user?.role === 'ADMIN'
  const isManager = user?.role === 'MANAGER' || isAdmin
  const notifIcons = { success: '✅', warning: '⚠️', info: 'ℹ️', error: '❌' }
 
  const avatarBg = isAdmin
    ? 'linear-gradient(135deg,#e53e3e,#c53030)'
    : isManager
      ? 'linear-gradient(135deg,#E8701A,#c05a10)'
      : 'linear-gradient(135deg,var(--teal),var(--teal-dark))'
 
  // ── Search across leads, tasks, projects ─────────────────────
  const q = searchVal.trim().toLowerCase()
 
  const results = q.length < 2 ? [] : [
    ...LEADS_DATA
      .filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map(l => ({
        type: 'Lead', icon: '👥',
        bg: 'var(--teal-dim)', color: 'var(--teal)',
        title: l.name,
        sub: `${l.company} · ${l.city}`,
        badge: l.status, path: '/leads',
      })),
 
    ...TASKS_DATA
      .filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.lead || '').toLowerCase().includes(q) ||
        (t.agent || '').toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map(t => ({
        type: 'Task', icon: '✅',
        bg: 'var(--blue-dim)', color: '#3b82f6',
        title: t.title,
        sub: `${t.agent} · Due ${t.due}`,
        badge: t.status, path: '/tasks',
      })),
 
    ...PROJECTS_DATA
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.client || '').toLowerCase().includes(q)
      )
      .slice(0, 2)
      .map(p => ({
        type: 'Project', icon: '📁',
        bg: 'var(--orange-dim)', color: 'var(--orange)',
        title: p.name,
        sub: `${p.client} · ${p.progress}% complete`,
        badge: p.status, path: '/projects',
      })),
  ]
 
  // Close search dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Calculate notification panel position from button's viewport coords
  const handleNotifToggle = () => {
    if (!showNotifs && notifBtnRef.current) {
      const rect = notifBtnRef.current.getBoundingClientRect()
      const panelWidth = Math.min(340, window.innerWidth - 16)
      const rightEdge  = window.innerWidth - rect.right
      // Clamp so panel never goes off the left edge
      const clampedRight = Math.max(8, Math.min(rightEdge, window.innerWidth - panelWidth - 8))
      setNotifPos({ top: rect.bottom + 8, right: clampedRight })
    }
    setShowNotifs(p => !p)
    setShowResults(false)
  }
 
  const handleResultClick = path => {
    setSearchVal('')
    setShowResults(false)
    navigate(path)
  }
 
  const handleKey = e => {
    if (e.key === 'Escape') { setSearchVal(''); setShowResults(false) }
    if (e.key === 'Enter' && results.length > 0) handleResultClick(results[0].path)
  }
 
  // Badge colours
  const bs = badge => ({
    NEW:         { bg:'var(--bg1)',         color:'var(--text3)'   },
    CONTACTED:   { bg:'var(--blue-dim)',    color:'var(--blue)'    },
    FOLLOW_UP:   { bg:'var(--orange-dim)', color:'var(--orange)'  },
    QUALIFIED:   { bg:'var(--purple-dim)', color:'var(--purple)'  },
    CLOSED:      { bg:'var(--green-dim)',  color:'var(--green)'   },
    PENDING:     { bg:'var(--orange-dim)', color:'var(--orange)'  },
    IN_PROGRESS: { bg:'var(--blue-dim)',   color:'var(--blue)'    },
    COMPLETED:   { bg:'var(--green-dim)',  color:'var(--green)'   },
    ACTIVE:      { bg:'var(--teal-dim)',   color:'var(--teal)'    },
    ON_HOLD:     { bg:'var(--bg1)',        color:'var(--text3)'   },
  }[badge] || { bg:'var(--bg1)', color:'var(--text3)' })
 
  return (
    <>
      <header className="app-header">
 
        {/* ☰ Toggle */}
        <button
          className="header-toggle"
          onClick={onToggle}
          title="Menu"
          style={{ WebkitTapHighlightColor:'transparent' }}
        >
          ☰
        </button>
 
        {/* ── Search ── */}
        <div
          ref={searchRef}
          style={{ flex:1, maxWidth:440, position:'relative' }}
          className="header-search-wrap"
        >
          <div className="header-search">
            <span style={{ color:'var(--text3)', fontSize:15, flexShrink:0 }}>🔍</span>
            <input
              type="text"
              placeholder="Search leads, tasks, projects…"
              value={searchVal}
              onChange={e => { setSearchVal(e.target.value); setShowResults(true) }}
              onFocus={() => q.length >= 2 && setShowResults(true)}
              onKeyDown={handleKey}
              style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:13.5, color:'var(--text1)', minWidth:0 }}
            />
            {searchVal
              ? <button onClick={() => { setSearchVal(''); setShowResults(false) }}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:16, padding:'0 2px', flexShrink:0, lineHeight:1 }}>✕</button>
              : <kbd style={{ fontSize:10, color:'var(--text3)', background:'var(--bg1)', padding:'2px 7px', borderRadius:4, fontFamily:'var(--font-mono)', flexShrink:0 }}>⌘K</kbd>
            }
          </div>
 
          {/* Results dropdown */}
          {showResults && q.length >= 2 && (
            <div style={{
              position:'absolute', top:'calc(100% + 8px)', left:0, right:0,
              background:'#fff', border:'1.5px solid var(--border)',
              borderRadius:'var(--r-lg)', boxShadow:'var(--shadow-lg)',
              zIndex:400, overflow:'hidden',
              maxHeight:430, overflowY:'auto',
              animation:'slideDown .15s ease',
            }}>
              {results.length === 0 ? (
                <div style={{ padding:'28px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:34, marginBottom:8 }}>🔍</div>
                  <div style={{ fontWeight:700, fontSize:13.5, color:'var(--text1)' }}>
                    No results for "{searchVal}"
                  </div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>
                    Try a lead name, company, task, or project
                  </div>
                </div>
              ) : (
                <>
                  {['Lead','Task','Project'].map(type => {
                    const group = results.filter(r => r.type === type)
                    if (!group.length) return null
                    return (
                      <div key={type}>
                        <div style={{
                          padding:'7px 14px 4px',
                          fontSize:10, fontWeight:800, letterSpacing:1.5,
                          textTransform:'uppercase', color:'var(--text3)',
                          background:'var(--bg0)', borderBottom:'1px solid var(--border)',
                        }}>
                          {group[0].icon} {type}s
                        </div>
                        {group.map((item, i) => {
                          const { bg: bBg, color: bColor } = bs(item.badge)
                          return (
                            <div
                              key={i}
                              onClick={() => handleResultClick(item.path)}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg0)'}
                              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                              style={{
                                display:'flex', alignItems:'center', gap:12,
                                padding:'10px 14px', cursor:'pointer',
                                borderBottom:'1px solid var(--border)',
                                transition:'background .1s',
                                WebkitTapHighlightColor:'transparent',
                              }}
                            >
                              <div style={{
                                width:34, height:34, borderRadius:9,
                                background:item.bg,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontSize:16, flexShrink:0,
                              }}>
                                {item.icon}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{
                                  fontWeight:700, fontSize:13.5, color:'var(--text1)',
                                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                                }}>
                                  {highlightMatch(item.title, q)}
                                </div>
                                <div style={{ fontSize:11.5, color:'var(--text2)', marginTop:2 }}>
                                  {item.sub}
                                </div>
                              </div>
                              <div style={{
                                fontSize:9.5, fontWeight:800, letterSpacing:.5,
                                textTransform:'uppercase',
                                background:bBg, color:bColor,
                                padding:'3px 8px', borderRadius:20, flexShrink:0,
                              }}>
                                {item.badge?.replace('_',' ')}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                  <div style={{
                    padding:'8px 14px', background:'var(--bg0)',
                    fontSize:11.5, color:'var(--text3)', fontWeight:600,
                    textAlign:'center', borderTop:'1px solid var(--border)',
                  }}>
                    {results.length} result{results.length !== 1 ? 's' : ''} · Press Enter to open first
                  </div>
                </>
              )}
            </div>
          )}
        </div>
 
        {/* Right actions */}
        <div className="header-actions">
 
          {/* 🔔 Notifications */}
          <div style={{ position:'relative' }}>
            <button
              ref={notifBtnRef}
              className="header-btn"
              onClick={handleNotifToggle}
              title="Notifications"
              style={{ WebkitTapHighlightColor:'transparent' }}
            >
              🔔
              {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
            </button>
          </div>

          {/* 👤 Avatar */}
          <div
            className="header-user"
            onClick={() => navigate('/profile')}
            style={{ cursor:'pointer', WebkitTapHighlightColor:'transparent' }}
          >
            <div className="avatar avatar-sm" style={{ background:avatarBg }}>
              {user?.initials || '?'}
            </div>
            <span className="hide-mobile">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </div>
 
        </div>
      </header>

      {/* 🔔 Notification panel — rendered in root via fixed positioning */}
      {showNotifs && (
        <div style={{
          position:'fixed',
          top: notifPos.top,
          right: notifPos.right,
          width: Math.min(340, window.innerWidth - 16),
          background:'#fff', border:'1.5px solid var(--border)',
          borderRadius:'var(--r-lg)', boxShadow:'var(--shadow-lg)',
          zIndex:300, overflow:'hidden', animation:'slideDown .15s ease',
        }}>
          <div style={{
            padding:'12px 16px', borderBottom:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <span style={{ fontWeight:700, fontSize:14 }}>Notifications</span>
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
          </div>
          <div style={{ maxHeight:360, overflowY:'auto' }}>
            {notifications.length === 0
              ? <div style={{ padding:24, textAlign:'center', color:'var(--text3)' }}>No notifications</div>
              : notifications.map(n => (
                <div key={n.id} onClick={() => { markNotifRead(n.id); setShowNotifs(false) }}
                  style={{
                    padding:'12px 16px', borderBottom:'1px solid var(--border)',
                    cursor:'pointer',
                    background:n.read ? '#fff' : 'var(--teal-pale)',
                    transition:'background .15s',
                  }}
                >
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ fontSize:17 }}>{notifIcons[n.type]}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{n.title}</div>
                      <div style={{ fontSize:12.5, color:'var(--text2)', marginTop:2 }}>{n.message}</div>
                      <div style={{ fontSize:11, color:'var(--text3)', marginTop:4, fontFamily:'var(--font-mono)' }}>{n.time}</div>
                    </div>
                    {!n.read && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--teal)', flexShrink:0, marginTop:4 }} />}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
 
      {/* Close notifs backdrop */}
      {showNotifs && (
        <div style={{ position:'fixed', inset:0, zIndex:299 }} onClick={() => setShowNotifs(false)} />
      )}
    </>
  )
}
 
// ── Yellow highlight for matched text ────────────────────────
function highlightMatch(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background:'#fef08a', color:'var(--text1)', borderRadius:3, padding:'0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}