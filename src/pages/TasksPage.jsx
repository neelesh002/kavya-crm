// ════════════════════════════════════════════
// TASKS PAGE — FULLY RESPONSIVE
// ════════════════════════════════════════════
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { StatusBadge, StatCard, Modal, FormGroup, ConfirmDialog } from '../components/UI'
import { USERS_DATA } from '../data/sampleData'

const PRIORITY_COLOR = { LOW: '#8896a8', MEDIUM: '#3b82f6', HIGH: '#E8701A', URGENT: '#ef4444' }
const TYPE_ICON = { CALL: '📞', EMAIL: '📧', MEETING: '🤝', FOLLOW_UP: '🔄', DEMO: '💻', OTHER: '📌' }
const STATUS_ICON = { PENDING: '⏳', IN_PROGRESS: '🔄', COMPLETED: '✅', CANCELLED: '❌' }

// ── Task Card (mobile) ─────────────────────────────────────
function TaskCard({ t, onEdit, onDelete, onComplete }) {
  const isCompleted = t.status === 'COMPLETED'
  return (
    <div style={{
      background: 'var(--bg1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      opacity: isCompleted ? 0.7 : 1,
    }}>
      {/* Title + priority dot */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
          {TYPE_ICON[t.type] || '📌'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="fw-700"
            style={{
              fontSize: 14,
              textDecoration: isCompleted ? 'line-through' : 'none',
              opacity: isCompleted ? 0.55 : 1,
              wordBreak: 'break-word',
            }}
          >
            {t.title}
          </div>
          {t.lead && (
            <div className="text-teal fw-600" style={{ fontSize: 12, marginTop: 2 }}>
              🔗 {t.lead}
            </div>
          )}
        </div>
        {/* Priority badge */}
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
          padding: '3px 8px', borderRadius: 99, flexShrink: 0,
          background: PRIORITY_COLOR[t.priority] + '22',
          color: PRIORITY_COLOR[t.priority],
        }}>
          {t.priority}
        </span>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 12 }}>
        <span style={{ color: 'var(--text2)' }}>
          <span style={{ color: 'var(--text3)' }}>Agent: </span>
          <strong>{t.agent?.split(' ')[0]}</strong>
        </span>
        <span style={{ color: 'var(--text2)' }}>
          <span style={{ color: 'var(--text3)' }}>Due: </span>
          <strong className="font-mono">{t.due || '—'}</strong>
        </span>
        <span className="badge badge-blue" style={{ fontSize: 11 }}>{t.type}</span>
      </div>

      {/* Status + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <StatusBadge status={t.status} />
        <div style={{ display: 'flex', gap: 6 }}>
          {!isCompleted && (
            <button
              className="btn btn-success btn-icon btn-sm"
              title="Mark Complete"
              onClick={() => onComplete(t.id)}
            >✓</button>
          )}
          <button className="btn btn-outline btn-icon btn-sm" onClick={() => onEdit(t)}>✏️</button>
          <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(t.id)}>🗑</button>
        </div>
      </div>
    </div>
  )
}

export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, leads, toast } = useApp()
  const [modalOpen, setModal]   = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterStatus, setFSt]  = useState('')
  const [filterAgent, setFAg]   = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const agents  = USERS_DATA.filter(u => u.role !== 'ADMIN')
  const filtered = tasks.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false
    if (filterAgent  && t.agent  !== filterAgent)  return false
    return true
  })

  const stats = [
    { icon:'⏳', value: tasks.filter(t=>t.status==='PENDING').length,     label:'Pending',     color:'var(--orange)', bg:'var(--orange-dim)' },
    { icon:'🔄', value: tasks.filter(t=>t.status==='IN_PROGRESS').length, label:'In Progress', color:'#3b82f6',       bg:'var(--blue-dim)' },
    { icon:'✅', value: tasks.filter(t=>t.status==='COMPLETED').length,   label:'Completed',   color:'var(--green)',  bg:'var(--green-dim)' },
    { icon:'❌', value: tasks.filter(t=>t.status==='CANCELLED').length,   label:'Cancelled',   color:'var(--red)',    bg:'var(--red-dim)' },
  ]

  const [form, setForm] = useState({ title:'', lead:'', agent:'Ananya Rao', due:'', priority:'HIGH', status:'PENDING', type:'CALL', desc:'' })
  const setF = (k,v) => setForm(f => ({ ...f, [k]:v }))

  const openNew  = () => {
    setEditTask(null)
    setForm({ title:'', lead:'', agent:'Ananya Rao', due:'', priority:'HIGH', status:'PENDING', type:'CALL', desc:'' })
    setModal(true)
  }
  const openEdit = task => { setEditTask(task); setForm(task); setModal(true) }
  const handleSave = () => {
    if (editTask) updateTask(editTask.id, form)
    else addTask({ ...form, initials: agents.find(a=>`${a.firstName} ${a.lastName}`===form.agent)?.initials || 'SA' })
    setModal(false)
  }

  const hasActiveFilters = filterStatus || filterAgent

  return (
    <>
      <style>{`
        /* ── Page header ── */
        .tasks-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }
        .tasks-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        /* Filters shown inline on desktop */
        .tasks-filter-selects {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        /* Mobile filter toggle — hidden on desktop */
        .tasks-filter-mobile-btn {
          display: none;
        }
        /* Mobile filter panel — hidden by default */
        .tasks-filter-panel {
          display: none;
          gap: 8px;
          flex-wrap: wrap;
          padding: 12px 16px;
          background: var(--bg1);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          margin-bottom: 16px;
        }
        .tasks-filter-panel.open {
          display: flex;
        }

        /* ── Stats grid responsive ── */
        .tasks-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        /* ── Table ── */
        .tasks-table-desktop { display: block; }
        /* ── Mobile card list ── */
        .tasks-card-list {
          display: none;
          flex-direction: column;
          gap: 12px;
          padding: 12px 16px;
        }

        /* ── Table footer ── */
        .tasks-table-footer {
          padding: 12px 16px;
          font-size: 13px;
          color: var(--text3);
          font-weight: 600;
          border-top: 1px solid var(--border);
        }

        /* ── Tablet (≤ 900px): 2-col stats ── */
        @media (max-width: 900px) {
          .tasks-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* ── Mobile (≤ 768px) ── */
        @media (max-width: 768px) {
          .tasks-page-header {
            flex-direction: column;
            align-items: stretch;
          }
          .tasks-header-right {
            justify-content: space-between;
          }
          /* Hide inline filter selects; show toggle btn */
          .tasks-filter-selects {
            display: none;
          }
          .tasks-filter-mobile-btn {
            display: inline-flex;
            position: relative;
          }
          /* Show mobile filter panel when .open */
          /* Hide desktop table, show cards */
          .tasks-table-desktop {
            display: none !important;
          }
          .tasks-card-list {
            display: flex !important;
          }
        }

        /* ── Small phones (≤ 480px) ── */
        @media (max-width: 480px) {
          .tasks-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .tasks-header-right .btn {
            font-size: 12px;
            padding: 6px 10px;
          }
        }
      `}</style>

      <div className="animate-fadeup">

        {/* ── Page Header ── */}
        <div className="tasks-page-header page-header">
          <div>
            <h1 className="page-title">Task Management</h1>
            <p className="page-subtitle">Manage and track all team tasks</p>
          </div>
          <div className="tasks-header-right page-actions">
            {/* Desktop: filters inline */}
            <div className="tasks-filter-selects">
              <select className="form-select" style={{ width: 130 }} value={filterStatus} onChange={e => setFSt(e.target.value)}>
                <option value="">All Status</option>
                {['PENDING','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select className="form-select" style={{ width: 130 }} value={filterAgent} onChange={e => setFAg(e.target.value)}>
                <option value="">All Agents</option>
                {agents.map(u => <option key={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>

            {/* Mobile: filter toggle */}
            <button
              className="btn btn-outline btn-sm tasks-filter-mobile-btn"
              onClick={() => setFiltersOpen(o => !o)}
              style={{ position: 'relative' }}
            >
              ⚙ Filters
              {hasActiveFilters && (
                <span style={{
                  position: 'absolute', top: -5, right: -5,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--teal)', border: '2px solid var(--bg1)'
                }} />
              )}
            </button>

            <button className="btn btn-primary" onClick={openNew}>+ New Task</button>
          </div>
        </div>

        {/* ── Mobile filter panel ── */}
        <div className={`tasks-filter-panel ${filtersOpen ? 'open' : ''}`}>
          <select
            className="form-select"
            style={{ flex: 1, minWidth: 120 }}
            value={filterStatus}
            onChange={e => setFSt(e.target.value)}
          >
            <option value="">All Status</option>
            {['PENDING','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            className="form-select"
            style={{ flex: 1, minWidth: 120 }}
            value={filterAgent}
            onChange={e => setFAg(e.target.value)}
          >
            <option value="">All Agents</option>
            {agents.map(u => <option key={u.id}>{u.firstName} {u.lastName}</option>)}
          </select>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setFSt(''); setFAg(''); setFiltersOpen(false) }}
          >
            ✕ Clear
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="tasks-stats-grid">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* ── Table / Cards ── */}
        <div className="table-wrapper">

          {/* Desktop table */}
          <div className="tasks-table-desktop overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Lead</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span className="fw-600" style={t.status === 'COMPLETED' ? { textDecoration: 'line-through', opacity: .55 } : {}}>
                        {TYPE_ICON[t.type]} {t.title}
                      </span>
                    </td>
                    <td className="text-teal fw-600">{t.lead || '—'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-sm">{t.initials}</div>
                        <span className="text-sm fw-600">{t.agent}</span>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{t.due}</td>
                    <td><span className="badge badge-blue">{t.type}</span></td>
                    <td><StatusBadge status={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-icon btn-sm" onClick={() => openEdit(t)}>✏️</button>
                        <button className="btn btn-success btn-icon btn-sm" title="Mark Complete" onClick={() => updateTask(t.id, { status: 'COMPLETED' })}>✓</button>
                        <button className="btn btn-danger  btn-icon btn-sm" onClick={() => setDeleteId(t.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                      No tasks found.{' '}
                      <span className="text-teal fw-700" style={{ cursor: 'pointer' }} onClick={openNew}>Create one?</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="tasks-card-list">
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>
                No tasks found.{' '}
                <span className="text-teal fw-700" style={{ cursor: 'pointer' }} onClick={openNew}>Create one?</span>
              </div>
            ) : filtered.map(t => (
              <TaskCard
                key={t.id}
                t={t}
                onEdit={openEdit}
                onDelete={setDeleteId}
                onComplete={(id) => updateTask(id, { status: 'COMPLETED' })}
              />
            ))}
          </div>

          <div className="tasks-table-footer">
            Showing {filtered.length} task{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ── Modal ── */}
        <Modal
          open={modalOpen}
          onClose={() => setModal(false)}
          title={editTask ? '✏️ Edit Task' : '✅ New Task'}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editTask ? 'Save' : 'Create Task'}</button>
            </>
          }
        >
          <FormGroup label="Task Title" required>
            <input className="form-input" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="Demo call with client" />
          </FormGroup>
          <div className="grid-2">
            <FormGroup label="Assign To">
              <select className="form-select" value={form.agent} onChange={e => setF('agent', e.target.value)}>
                {agents.map(u => <option key={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Due Date">
              <input className="form-input" type="date" value={form.due} onChange={e => setF('due', e.target.value)} />
            </FormGroup>
          </div>
          <div className="grid-2">
            <FormGroup label="Priority">
              <select className="form-select" value={form.priority} onChange={e => setF('priority', e.target.value)}>
                {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p}>{p}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Task Type">
              <select className="form-select" value={form.type} onChange={e => setF('type', e.target.value)}>
                {['CALL','EMAIL','MEETING','FOLLOW_UP','DEMO','OTHER'].map(t => <option key={t}>{t}</option>)}
              </select>
            </FormGroup>
          </div>
          <FormGroup label="Description">
            <textarea className="form-textarea" value={form.desc} onChange={e => setF('desc', e.target.value)} placeholder="Task details…" />
          </FormGroup>
        </Modal>

        <ConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => deleteTask(deleteId)}
          title="Delete Task"
          message="Are you sure you want to delete this task?"
          confirmLabel="Delete"
          danger
        />
      </div>
    </>
  )
}