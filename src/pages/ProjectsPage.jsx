import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { StatCard, StatusBadge, Modal, FormGroup, ProgressBar } from '../components/UI'
import { USERS_DATA } from '../data/sampleData'
 
const STATUS_COLORS = {
  ACTIVE:      'var(--teal)',
  IN_PROGRESS: '#3b82f6',
  COMPLETED:   'var(--green)',
  ON_HOLD:     'var(--orange)',
}

const ALL_AGENTS = USERS_DATA.filter(u => u.role !== 'ADMIN')
const parseProjectDate = (value) => {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
const toDateInputValue = (value) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = parseProjectDate(value)
  if (!parsed) return ''
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const formatProjectDate = (value) => {
  if (!value) return '—'
  const parsed = parseProjectDate(value)
  if (!parsed) return value
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
const hasInvalidDateRange = (start, end) => {
  const startValue = toDateInputValue(start)
  const endValue = toDateInputValue(end)
  return Boolean(startValue && endValue && endValue < startValue)
}
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Start' },
  { value: 'oldest', label: 'Oldest Start' },
  { value: 'budget_high', label: 'Budget: High to Low' },
  { value: 'budget_low', label: 'Budget: Low to High' },
  { value: 'progress_high', label: 'Progress: High to Low' },
  { value: 'name_az', label: 'Name: A to Z' },
]
const ErrMsg = ({ msg }) => msg ? <span className="field-error">{msg}</span> : null
const ic = (err) => err ? 'form-input input-error' : 'form-input'
const sc = (err) => err ? 'form-select input-error' : 'form-select'

const validateProjectForm = (form, { requireProgress = false } = {}) => {
  const errors = {}
  const budget = form.budget === '' ? NaN : Number(form.budget)
  const progress = form.progress === '' || form.progress == null ? NaN : Number(form.progress)

  if (!String(form.name || '').trim()) errors.name = 'Project name is required'
  if (!String(form.client || '').trim()) errors.client = 'Client name is required'
  if (!form.start) errors.start = 'Start date is required'
  if (!form.end) errors.end = 'End date is required'
  if (!form.leader) errors.leader = 'Team leader is required'
  if (!form.status) errors.status = 'Status is required'
  if (!Number.isFinite(budget) || budget <= 0) errors.budget = 'Budget must be greater than 0'
  if (hasInvalidDateRange(form.start, form.end)) errors.end = 'End date cannot be earlier than start date'
  if (requireProgress && (!Number.isFinite(progress) || progress < 0 || progress > 100)) {
    errors.progress = 'Progress must be between 0 and 100'
  }

  return errors
}
 
export default function ProjectsPage() {
  const { toast, projects, setProjects } = useApp()
  const { isAdmin, isManager } = useAuth()
  const canEdit = isAdmin || isManager   // Agents cannot edit

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [leaderFilter, setLeaderFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
 
  // ── New project modal ──────────────────────────────
  const [newOpen, setNewOpen] = useState(false)
  const [newForm, setNewForm] = useState({
    name: '', client: '', budget: '', start: '', end: '',
    status: 'ACTIVE', leader: 'Ananya Rao', desc: '',
  })
  const [newErrors, setNewErrors] = useState({})
  const setN = (k, v) => {
    setNewForm(f => ({ ...f, [k]: v }))
    setNewErrors(e => ({ ...e, [k]: '' }))
  }
 
  // ── Edit modal ─────────────────────────────────────
  const [editOpen,    setEditOpen]    = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [editForm,    setEditForm]    = useState({})
  const [editErrors, setEditErrors] = useState({})
  const setE = (k, v) => {
    setEditForm(f => ({ ...f, [k]: v }))
    setEditErrors(e => ({ ...e, [k]: '' }))
  }
 
  // ── Team modal ─────────────────────────────────────
  const [teamOpen,    setTeamOpen]    = useState(false)
  const [teamProject, setTeamProject] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
 
  // ── Delete confirm ─────────────────────────────────
  const [deleteOpen,    setDeleteOpen]    = useState(false)
  const [deleteProject, setDeleteProject] = useState(null)
 
  // ══════════════════════════════════════════
  // HANDLERS
  // ══════════════════════════════════════════
 
  // Create new project
  const handleCreate = e => {
    e.preventDefault()
    const errors = validateProjectForm(newForm)
    if (Object.keys(errors).length) {
      setNewErrors(errors)
      toast('Please fix the errors', 'error')
      return
    }
    const initials = newForm.leader.split(' ').map(w => w[0]).join('')
    const project = {
      ...newForm,
      name:     newForm.name.trim(),
      client:   newForm.client.trim(),
      desc:     newForm.desc.trim(),
      id:       Date.now(),
      progress: 0,
      li:       initials,
      team:     [initials],
      budget:   parseInt(newForm.budget, 10) || 0,
    }
    setProjects(p => [...p, project])
    setNewOpen(false)
    setNewForm({ name:'', client:'', budget:'', start:'', end:'', status:'ACTIVE', leader:'Ananya Rao', desc:'' })
    setNewErrors({})
    toast('✅ Project created successfully!')
  }
 
  // Open Edit modal — prefill form with project data
  const openEdit = (project) => {
    setEditProject(project)
    setEditForm({
      name:     project.name,
      client:   project.client,
      budget:   project.budget,
      start:    toDateInputValue(project.start),
      end:      toDateInputValue(project.end),
      status:   project.status,
      leader:   project.leader,
      desc:     project.desc || '',
      progress: project.progress,
    })
    setEditErrors({})
    setEditOpen(true)
  }
 
  // Save edited project
  const handleEditSave = e => {
    e.preventDefault()
    const errors = validateProjectForm(editForm, { requireProgress: true })
    if (Object.keys(errors).length) {
      setEditErrors(errors)
      toast('Please fix the errors', 'error')
      return
    }
    const initials = editForm.leader.split(' ').map(w => w[0]).join('')
    setProjects(prev => prev.map(p =>
      p.id === editProject.id
        ? {
            ...p,
            ...editForm,
            name: editForm.name.trim(),
            client: editForm.client.trim(),
            desc: (editForm.desc || '').trim(),
            li: initials,
            budget: parseInt(editForm.budget, 10) || 0,
            progress: parseInt(editForm.progress, 10) || 0
          }
        : p
    ))
    setEditOpen(false)
    setEditErrors({})
    toast('✅ Project updated successfully!')
  }
 
  // Open Team modal — load current team members
  const openTeam = (project) => {
    setTeamProject(project)
    // Map initials back to full user objects
    const currentTeam = ALL_AGENTS.filter(u => {
      const ini = u.firstName[0] + u.lastName[0]
      return project.team.includes(ini)
    })
    setTeamMembers(currentTeam.map(u => u.id))
    setTeamOpen(true)
  }
 
  // Toggle a member in/out of team
  const toggleMember = (userId) => {
    setTeamMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }
 
  // Save team changes
  const handleTeamSave = () => {
    const selected = ALL_AGENTS.filter(u => teamMembers.includes(u.id))
    const initials = selected.map(u => u.firstName[0] + u.lastName[0])
    setProjects(prev => prev.map(p =>
      p.id === teamProject.id ? { ...p, team: initials } : p
    ))
    setTeamOpen(false)
    toast(`✅ Team updated — ${selected.length} member${selected.length !== 1 ? 's' : ''}`)
  }
 
  // Open delete confirm
  const openDelete = (project) => {
    setDeleteProject(project)
    setDeleteOpen(true)
  }
 
  // Confirm delete
  const handleDelete = () => {
    setProjects(prev => prev.filter(p => p.id !== deleteProject.id))
    setDeleteOpen(false)
    toast('🗑️ Project deleted')
  }
 
  // ══════════════════════════════════════════
  // STATS
  // ══════════════════════════════════════════
  const stats = [
    { icon:'📁', value: projects.length,                                      label:'Total',       color:'var(--teal)',   bg:'var(--teal-dim)'  },
    { icon:'🔄', value: projects.filter(p => p.status === 'IN_PROGRESS').length, label:'In Progress', color:'#3b82f6',      bg:'var(--blue-dim)'  },
    { icon:'✅', value: projects.filter(p => p.status === 'COMPLETED').length,   label:'Completed',   color:'var(--green)', bg:'var(--green-dim)' },
    { icon:'⏸️', value: projects.filter(p => p.status === 'ON_HOLD').length,     label:'On Hold',     color:'var(--orange)',bg:'var(--orange-dim)'},
  ]

  const leaderOptions = [...new Set(projects.map(p => p.leader).filter(Boolean))]
  const filteredProjects = projects
    .filter(p => {
      const q = search.trim().toLowerCase()
      if (q) {
        const haystack = [p.name, p.client, p.leader, p.status, p.desc]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (statusFilter && p.status !== statusFilter) return false
      if (leaderFilter && p.leader !== leaderFilter) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (parseProjectDate(a.start)?.getTime() || 0) - (parseProjectDate(b.start)?.getTime() || 0)
        case 'budget_high':
          return (Number(b.budget) || 0) - (Number(a.budget) || 0)
        case 'budget_low':
          return (Number(a.budget) || 0) - (Number(b.budget) || 0)
        case 'progress_high':
          return (Number(b.progress) || 0) - (Number(a.progress) || 0)
        case 'name_az':
          return String(a.name || '').localeCompare(String(b.name || ''))
        case 'newest':
        default:
          return (parseProjectDate(b.start)?.getTime() || 0) - (parseProjectDate(a.start)?.getTime() || 0)
      }
    })

  const closeNewModal = () => {
    setNewOpen(false)
    setNewErrors({})
  }

  const closeEditModal = () => {
    setEditOpen(false)
    setEditErrors({})
  }
 
  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════
  return (
<div className="animate-fadeup">
 
      {/* Page header */}
<div className="page-header">
<div>
<h1 className="page-title">Projects</h1>
<p className="page-subtitle">Resource allocation & project tracking</p>
</div>
        {canEdit && (
<div className="page-actions">
<button className="btn btn-primary" onClick={() => setNewOpen(true)}>
              + New Project
</button>
</div>
        )}
</div>
 
      {/* Stats */}
<div className="stats-grid">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
</div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid-4" style={{ alignItems: 'end' }}>
          <FormGroup label="Search Projects">
            <input
              className="form-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, client, leader..."
            />
          </FormGroup>
          <FormGroup label="Status">
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {['ACTIVE', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </FormGroup>
          <FormGroup label="Team Leader">
            <select className="form-select" value={leaderFilter} onChange={e => setLeaderFilter(e.target.value)}>
              <option value="">All Leaders</option>
              {leaderOptions.map(leader => (
                <option key={leader} value={leader}>{leader}</option>
              ))}
            </select>
          </FormGroup>
          <FormGroup label="Sort By">
            <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </FormGroup>
        </div>
        <div className="flex justify-between items-center" style={{ marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
          <span className="text-sm text-muted fw-600">{filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found</span>
          {(search || statusFilter || leaderFilter) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setLeaderFilter('')
                setSortBy('newest')
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
 
      {/* Project cards grid */}
<div className="projects-grid">
        {filteredProjects.map(p => {
          const col = STATUS_COLORS[p.status] || 'var(--teal)'
          return (
<div className="card" key={p.id}>
 
              {/* Title + status */}
<div className="flex justify-between items-start mb-4">
<div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
<div className="fw-700" style={{ fontSize: 14.5, fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                    {p.name}
</div>
<div className="text-sm text-muted mt-1">{p.client}</div>
</div>
<StatusBadge status={p.status} />
</div>
 
              {/* Budget + timeline */}
<div className="project-meta-grid">
<div className="project-meta-chip">
<div className="meta-label">Budget</div>
<div className="meta-value text-teal">₹{(p.budget / 1000).toFixed(0)}k</div>
</div>
<div className="project-meta-chip">
<div className="meta-label">Timeline</div>
<div className="meta-value">
                    {formatProjectDate(p.start)} – {formatProjectDate(p.end)}
</div>
</div>
</div>
 
              {/* Progress bar */}
<div className="mb-4">
<div className="flex justify-between mb-2">
<span className="text-sm text-muted fw-700">Progress</span>
<span className="font-mono text-sm fw-700" style={{ color: col }}>
                    {p.progress}%
</span>
</div>
<ProgressBar value={p.progress} color={col} />
</div>
 
              {/* Team avatars + leader */}
<div className="flex justify-between items-center mb-4">
<div className="flex items-center gap-1">
<span className="text-xs text-muted fw-700">Team:</span>
                  {p.team.map(ini => (
<div key={ini} className="avatar avatar-sm" style={{ marginLeft: 2 }} title={ini}>
                      {ini}
</div>
                  ))}
</div>
<div className="flex items-center gap-2">
<div className="avatar avatar-sm">{p.li}</div>
<span className="text-sm fw-600 text-muted">{p.leader?.split(' ')[0]}</span>
</div>
</div>
 
              {/* Action buttons */}
<div className="flex gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {canEdit ? (
<>
<button
                      className="btn btn-outline btn-sm flex-1"
                      onClick={() => openEdit(p)}
>
                      ✏️ Edit
</button>
<button
                      className="btn btn-blue btn-sm flex-1"
                      onClick={() => openTeam(p)}
>
                      👥 Team
</button>
<button
                      className="btn btn-danger btn-sm btn-icon"
                      onClick={() => openDelete(p)}
                      title="Delete project"
>
                      🗑️
</button>
</>
                ) : (
                  // Agents can only view — read-only button
<button
                    className="btn btn-outline btn-sm flex-1"
                    onClick={() => toast('Contact your manager to edit projects', 'info')}
>
                    👁️ View Details
</button>
                )}
</div>
 
            </div>
          )
        })}
        {filteredProjects.length === 0 && (
<div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '28px 20px' }}>
<div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No projects found</div>
<div className="text-muted" style={{ fontSize: 13.5 }}>
              Try changing the search text or clearing the active filters.
</div>
</div>
        )}
</div>
 
      {/* ══════════════════════════════════════════
          MODAL 1 — Create New Project
      ══════════════════════════════════════════ */}
<Modal
        open={newOpen}
        onClose={closeNewModal}
        title="📁 New Project"
        footer={
<>
<button className="btn btn-outline" onClick={closeNewModal}>Cancel</button>
<button className="btn btn-primary" onClick={handleCreate}>Create Project</button>
</>
        }
>
<FormGroup label="Project Name" required>
<input
            className={ic(newErrors.name)}
            value={newForm.name}
            onChange={e => setN('name', e.target.value)}
            placeholder="CRM Implementation — ABC Corp"
            required
          />
<ErrMsg msg={newErrors.name} />
</FormGroup>
<div className="grid-2">
<FormGroup label="Client" required>
<input className={ic(newErrors.client)} value={newForm.client} onChange={e => setN('client', e.target.value)} placeholder="ABC Corporation" />
<ErrMsg msg={newErrors.client} />
</FormGroup>
<FormGroup label="Budget (₹)">
<input className={ic(newErrors.budget)} type="number" value={newForm.budget} onChange={e => setN('budget', e.target.value)} placeholder="500000" />
<ErrMsg msg={newErrors.budget} />
</FormGroup>
</div>
<div className="grid-2">
<FormGroup label="Start Date" required>
<input className={ic(newErrors.start)} type="date" value={newForm.start} onChange={e => setN('start', e.target.value)} />
<ErrMsg msg={newErrors.start} />
</FormGroup>
<FormGroup label="End Date" required>
<input className={ic(newErrors.end)} type="date" min={newForm.start || undefined} value={newForm.end} onChange={e => setN('end', e.target.value)} />
<ErrMsg msg={newErrors.end} />
</FormGroup>
</div>
<div className="grid-2">
<FormGroup label="Team Leader" required>
<select className={sc(newErrors.leader)} value={newForm.leader} onChange={e => setN('leader', e.target.value)}>
              {ALL_AGENTS.map(u => (
<option key={u.id}>{u.firstName} {u.lastName}</option>
              ))}
</select>
<ErrMsg msg={newErrors.leader} />
</FormGroup>
<FormGroup label="Status" required>
<select className={sc(newErrors.status)} value={newForm.status} onChange={e => setN('status', e.target.value)}>
              {['ACTIVE', 'IN_PROGRESS', 'ON_HOLD'].map(s => (
<option key={s}>{s}</option>
              ))}
</select>
<ErrMsg msg={newErrors.status} />
</FormGroup>
</div>
<FormGroup label="Description">
<textarea
            className="form-textarea"
            value={newForm.desc}
            onChange={e => setN('desc', e.target.value)}
            placeholder="Project description…"
          />
</FormGroup>
</Modal>
 
      {/* ══════════════════════════════════════════
          MODAL 2 — Edit Project
      ══════════════════════════════════════════ */}
<Modal
        open={editOpen}
        onClose={closeEditModal}
        title={`✏️ Edit — ${editProject?.name || ''}`}
        footer={
<>
<button className="btn btn-outline" onClick={closeEditModal}>Cancel</button>
<button className="btn btn-primary" onClick={handleEditSave}>Save Changes</button>
</>
        }
>
<FormGroup label="Project Name" required>
<input
            className={ic(editErrors.name)}
            value={editForm.name || ''}
            onChange={e => setE('name', e.target.value)}
            required
          />
<ErrMsg msg={editErrors.name} />
</FormGroup>
<div className="grid-2">
<FormGroup label="Client" required>
<input className={ic(editErrors.client)} value={editForm.client || ''} onChange={e => setE('client', e.target.value)} />
<ErrMsg msg={editErrors.client} />
</FormGroup>
<FormGroup label="Budget (₹)">
<input className={ic(editErrors.budget)} type="number" value={editForm.budget || ''} onChange={e => setE('budget', e.target.value)} />
<ErrMsg msg={editErrors.budget} />
</FormGroup>
</div>
<div className="grid-2">
<FormGroup label="Start Date" required>
<input className={ic(editErrors.start)} type="date" value={editForm.start || ''} onChange={e => setE('start', e.target.value)} />
<ErrMsg msg={editErrors.start} />
</FormGroup>
<FormGroup label="End Date" required>
<input className={ic(editErrors.end)} type="date" min={editForm.start || undefined} value={editForm.end || ''} onChange={e => setE('end', e.target.value)} />
<ErrMsg msg={editErrors.end} />
</FormGroup>
</div>
<div className="grid-2">
<FormGroup label="Team Leader" required>
<select className={sc(editErrors.leader)} value={editForm.leader || ''} onChange={e => setE('leader', e.target.value)}>
              {ALL_AGENTS.map(u => (
<option key={u.id}>{u.firstName} {u.lastName}</option>
              ))}
</select>
<ErrMsg msg={editErrors.leader} />
</FormGroup>
<FormGroup label="Status" required>
<select className={sc(editErrors.status)} value={editForm.status || ''} onChange={e => setE('status', e.target.value)}>
              {['ACTIVE', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].map(s => (
<option key={s}>{s}</option>
              ))}
</select>
<ErrMsg msg={editErrors.status} />
</FormGroup>
</div>
 
        {/* Progress slider — unique to Edit */}
<FormGroup label={`Progress — ${editForm.progress || 0}%`}>
<input
            type="range"
            min="0" max="100" step="5"
            value={editForm.progress || 0}
            onChange={e => setE('progress', e.target.value)}
            style={{ width: '100%', accentColor: 'var(--teal)' }}
          />
<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
<span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
</div>
<ErrMsg msg={editErrors.progress} />
</FormGroup>
 
        <FormGroup label="Description">
<textarea
            className="form-textarea"
            value={editForm.desc || ''}
            onChange={e => setE('desc', e.target.value)}
          />
</FormGroup>
</Modal>
 
      {/* ══════════════════════════════════════════
          MODAL 3 — Manage Team
      ══════════════════════════════════════════ */}
<Modal
        open={teamOpen}
        onClose={() => setTeamOpen(false)}
        title={`👥 Team — ${teamProject?.name || ''}`}
        footer={
<>
<button className="btn btn-outline" onClick={() => setTeamOpen(false)}>Cancel</button>
<button className="btn btn-primary" onClick={handleTeamSave}>
              Save Team ({teamMembers.length} selected)
</button>
</>
        }
>
        {/* Current leader info */}
<div style={{
          background: 'var(--teal-dim)',
          border: '1px solid rgba(26,171,176,.2)',
          borderRadius: 'var(--r-sm)',
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 4,
        }}>
<span style={{ fontSize: 18 }}>👑</span>
<div>
<div style={{ fontWeight: 700, fontSize: 13, color: 'var(--teal)' }}>Team Leader</div>
<div style={{ fontSize: 12.5, color: 'var(--text2)' }}>{teamProject?.leader}</div>
</div>
</div>
 
        <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginBottom: 12 }}>
          Select team members for this project:
</div>
 
        {/* Agent checkboxes */}
<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALL_AGENTS.map(u => {
            const ini       = u.firstName[0] + u.lastName[0]
            const isLeader  = `${u.firstName} ${u.lastName}` === teamProject?.leader
            const isChecked = teamMembers.includes(u.id)
 
            return (
<div
                key={u.id}
                onClick={() => !isLeader && toggleMember(u.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px',
                  border: `1.5px solid ${isChecked ? 'var(--teal)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-sm)',
                  background: isChecked ? 'var(--teal-dim)' : 'var(--bg0)',
                  cursor: isLeader ? 'default' : 'pointer',
                  transition: 'all .15s',
                  opacity: isLeader ? 0.75 : 1,
                }}
>
                {/* Checkbox */}
<div style={{
                  width: 20, height: 20,
                  border: `2px solid ${isChecked || isLeader ? 'var(--teal)' : 'var(--border2)'}`,
                  borderRadius: 5,
                  background: isChecked || isLeader ? 'var(--teal)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all .15s',
                }}>
                  {(isChecked || isLeader) && (
<span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>
                  )}
</div>
 
                {/* Avatar */}
<div className="avatar avatar-sm" style={{
                  background: isChecked
                    ? 'linear-gradient(135deg,var(--teal),var(--teal-dark))'
                    : 'var(--bg1)',
                  color: isChecked ? '#fff' : 'var(--text2)',
                }}>
                  {ini}
</div>
 
                {/* Name + designation */}
<div style={{ flex: 1 }}>
<div style={{ fontWeight: 700, fontSize: 13.5 }}>
                    {u.firstName} {u.lastName}
                    {isLeader && (
<span style={{
                        marginLeft: 8, fontSize: 10, fontWeight: 700,
                        color: 'var(--teal)', background: 'rgba(26,171,176,.12)',
                        padding: '2px 7px', borderRadius: 20,
                      }}>
                        Leader
</span>
                    )}
</div>
<div style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 1 }}>
                    {u.designation}
</div>
</div>
 
                {/* Active dot */}
<div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: u.active ? 'var(--green)' : 'var(--text3)',
                  flexShrink: 0,
                }} title={u.active ? 'Active' : 'Inactive'} />
</div>
            )
          })}
</div>
 
        <div style={{
          marginTop: 14, padding: '9px 12px',
          background: 'var(--bg0)', borderRadius: 'var(--r-sm)',
          fontSize: 12, color: 'var(--text3)', fontWeight: 600,
          border: '1px solid var(--border)',
        }}>
          💡 The team leader is always included automatically.
</div>
</Modal>
 
      {/* ══════════════════════════════════════════
          MODAL 4 — Delete Confirmation
      ══════════════════════════════════════════ */}
<Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="🗑️ Delete Project"
        footer={
<>
<button className="btn btn-outline" onClick={() => setDeleteOpen(false)}>Cancel</button>
<button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
</>
        }
>
<div style={{ textAlign: 'center', padding: '16px 0' }}>
<div style={{ fontSize: 48, marginBottom: 14 }}>⚠️</div>
<div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            Are you sure?
</div>
<div style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.6 }}>
            You are about to permanently delete<br />
<strong style={{ color: 'var(--text1)' }}>"{deleteProject?.name}"</strong><br />
            This action cannot be undone.
</div>
</div>
</Modal>
 
    </div>
  )
}
