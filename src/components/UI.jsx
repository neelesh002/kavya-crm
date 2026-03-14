import { useEffect } from 'react'

/* ── AVATAR ─────────────────────────────────── */
export function Avatar({ initials, size = 'md', color }) {
  const classes = ['avatar', `avatar-${size}`, color ? `avatar-${color}` : ''].join(' ')
  return <div className={classes}>{initials}</div>
}

/* ── BADGE ──────────────────────────────────── */
export function Badge({ children, variant }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

export function StatusBadge({ status }) {
  const label = status?.replace(/_/g, ' ') || status
  return <span className={`badge badge-${status}`}>{label}</span>
}

/* ── PROGRESS BAR ───────────────────────────── */
export function ProgressBar({ value = 0, color }) {
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${Math.min(value, 100)}%`, background: color || 'var(--teal)' }} />
    </div>
  )
}

/* ── MODAL ──────────────────────────────────── */
export function Modal({ open, onClose, title, children, footer, size }) {
  useEffect(() => {
    if (!open) return
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box ${size === 'lg' ? 'modal-lg' : size === 'sm' ? 'modal-sm' : ''}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

/* ── TOAST CONTAINER ────────────────────────── */
export function ToastContainer({ toasts, onRemove }) {
  const icons = { success: '✅', error: '❌', warn: '⚠️', info: 'ℹ️' }
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type || 'success'}`} onClick={() => onRemove(t.id)} style={{ cursor: 'pointer' }}>
          <span>{icons[t.type] || '✅'}</span>
          <span style={{ flex: 1 }}>{t.msg}</span>
          <span style={{ color: 'var(--text3)', fontSize: 14 }}>×</span>
        </div>
      ))}
    </div>
  )
}

/* ── FORM GROUP ─────────────────────────────── */
export function FormGroup({ label, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}</label>
      {children}
    </div>
  )
}

/* ── STAT CARD ──────────────────────────────── */
export function StatCard({ icon, value, label, trend, trendDir = 'up', color, bg }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color, '--stat-bg': bg }}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend && <div className={`stat-trend ${trendDir}`}>{trend}</div>}
      </div>
    </div>
  )
}

/* ── CARD ───────────────────────────────────── */
export function Card({ children, className = '', style }) {
  return <div className={`card ${className}`} style={style}>{children}</div>
}

export function CardHeader({ title, subtitle, actions }) {
  return (
    <div className="card-header">
      <div>
        <div className="card-title">{title}</div>
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ── TABS ───────────────────────────────────── */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs-bar">
      {tabs.map(tab => (
        <button key={tab.key} className={`tab-btn ${active === tab.key ? 'active' : ''}`} onClick={() => onChange(tab.key)}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/* ── EMPTY STATE ─────────────────────────────── */
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || '📋'}</div>
      <div className="empty-title">{title}</div>
      {desc && <div className="empty-desc">{desc}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ── TOGGLE SWITCH ───────────────────────────── */
export function ToggleSwitch({ on, onChange }) {
  return (
    <div className={`toggle-switch ${on ? 'on' : 'off'}`} onClick={() => onChange(!on)}>
      <div className="toggle-knob" />
    </div>
  )
}

/* ── CONFIRM DIALOG ─────────────────────────── */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </button>
        </>
      }>
      <p style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>{message}</p>
    </Modal>
  )
}

/* ── LOADING SPINNER ─────────────────────────── */
export function Spinner({ size = 16 }) {
  return <div className="animate-spin" style={{ width: size, height: size, border: '2px solid var(--border)', borderTopColor: 'var(--teal)', borderRadius: '50%' }} />
}

/* ── PAGINATION ──────────────────────────────── */
export function Pagination({ page, total, perPage = 10, onChange }) {
  const totalPages = Math.ceil(total / perPage)
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1)
  const start = (page - 1) * perPage + 1
  const end   = Math.min(page * perPage, total)

  return (
    <div className="table-footer">
      <span>Showing {start}–{end} of {total}</span>
      <div className="flex gap-1">
        <button className="btn btn-outline btn-sm" onClick={() => onChange(page - 1)} disabled={page === 1}>‹ Prev</button>
        {pages.map(p => (
          <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`} onClick={() => onChange(p)}>{p}</button>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => onChange(page + 1)} disabled={page === totalPages}>Next ›</button>
      </div>
    </div>
  )
}
