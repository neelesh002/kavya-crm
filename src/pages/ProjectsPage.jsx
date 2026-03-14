import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { StatCard, StatusBadge, Modal, FormGroup, ProgressBar } from '../components/UI'
import { PROJECTS_DATA, USERS_DATA } from '../data/sampleData'
 
const STATUS_COLORS = {
  ACTIVE:      'var(--teal)',
  IN_PROGRESS: '#3b82f6',
  COMPLETED:   'var(--green)',
  ON_HOLD:     'var(--orange)',
}
 
const ALL_AGENTS = USERS_DATA.filter(u => u.role !== 'ADMIN')
 
export default function ProjectsPage() {
  const { toast }             = useApp()
  const { isAdmin, isManager } = useAuth()
  const canEdit = isAdmin || isManager   // Agents cannot edit
 
  const [projects, setProjects] = useState(PROJECTS_DATA)
 
  // ── New project modal ──────────────────────────────
  const [newOpen, setNewOpen] = useState(false)
  const [newForm, setNewForm] = useState({
    name: '', client: '', budget: '', start: '', end: '',
    status: 'ACTIVE', leader: 'Ananya Rao', desc: '',
  })
  const setN = (k, v) => setNewForm(f => ({ ...f, [k]: v }))
 
  // ── Edit modal ─────────────────────────────────────
  const [editOpen,    setEditOpen]    = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [editForm,    setEditForm]    = useState({})
  const setE = (k, v) => setEditForm(f => ({ ...f, [k]: v }))
 
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
    const initials = newForm.leader.split(' ').map(w => w[0]).join('')
    const project = {
      ...newForm,
      id:       Date.now(),
      progress: 0,
      li:       initials,
      team:     [initials],
      budget:   parseInt(newForm.budget) || 0,
    }
    setProjects(p => [...p, project])
    setNewOpen(false)
    setNewForm({ name:'', client:'', budget:'', start:'', end:'', status:'ACTIVE', leader:'Ananya Rao', desc:'' })
    toast('✅ Project created successfully!')
  }
 
  // Open Edit modal — prefill form with project data
  const openEdit = (project) => {
    setEditProject(project)
    setEditForm({
      name:     project.name,
      client:   project.client,
      budget:   project.budget,
      start:    project.start,
      end:      project.end,
      status:   project.status,
      leader:   project.leader,
      desc:     project.desc || '',
      progress: project.progress,
    })
    setEditOpen(true)
  }
 
  // Save edited project
  const handleEditSave = e => {
    e.preventDefault()
    const initials = editForm.leader.split(' ').map(w => w[0]).join('')
    setProjects(prev => prev.map(p =>
      p.id === editProject.id
        ? { ...p, ...editForm, li: initials, budget: parseInt(editForm.budget) || 0, progress: parseInt(editForm.progress) || 0 }
        : p
    ))
    setEditOpen(false)
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
 
      {/* Project cards grid */}
<div className="projects-grid">
        {projects.map(p => {
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
                    {p.start?.split(',')[0]} – {p.end?.split(',')[0]}
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
</div>
 
      {/* ══════════════════════════════════════════
          MODAL 1 — Create New Project
      ══════════════════════════════════════════ */}
<Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="📁 New Project"
        footer={
<>
<button className="btn btn-outline" onClick={() => setNewOpen(false)}>Cancel</button>
<button className="btn btn-primary" onClick={handleCreate}>Create Project</button>
</>
        }
>
<FormGroup label="Project Name" required>
<input
            className="form-input"
            value={newForm.name}
            onChange={e => setN('name', e.target.value)}
            placeholder="CRM Implementation — ABC Corp"
            required
          />
</FormGroup>
<div className="grid-2">
<FormGroup label="Client">
<input className="form-input" value={newForm.client} onChange={e => setN('client', e.target.value)} placeholder="ABC Corporation" />
</FormGroup>
<FormGroup label="Budget (₹)">
<input className="form-input" type="number" value={newForm.budget} onChange={e => setN('budget', e.target.value)} placeholder="500000" />
</FormGroup>
</div>
<div className="grid-2">
<FormGroup label="Start Date">
<input className="form-input" type="date" value={newForm.start} onChange={e => setN('start', e.target.value)} />
</FormGroup>
<FormGroup label="End Date">
<input className="form-input" type="date" value={newForm.end} onChange={e => setN('end', e.target.value)} />
</FormGroup>
</div>
<div className="grid-2">
<FormGroup label="Team Leader">
<select className="form-select" value={newForm.leader} onChange={e => setN('leader', e.target.value)}>
              {ALL_AGENTS.map(u => (
<option key={u.id}>{u.firstName} {u.lastName}</option>
              ))}
</select>
</FormGroup>
<FormGroup label="Status">
<select className="form-select" value={newForm.status} onChange={e => setN('status', e.target.value)}>
              {['ACTIVE', 'IN_PROGRESS', 'ON_HOLD'].map(s => (
<option key={s}>{s}</option>
              ))}
</select>
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
        onClose={() => setEditOpen(false)}
        title={`✏️ Edit — ${editProject?.name || ''}`}
        footer={
<>
<button className="btn btn-outline" onClick={() => setEditOpen(false)}>Cancel</button>
<button className="btn btn-primary" onClick={handleEditSave}>Save Changes</button>
</>
        }
>
<FormGroup label="Project Name" required>
<input
            className="form-input"
            value={editForm.name || ''}
            onChange={e => setE('name', e.target.value)}
            required
          />
</FormGroup>
<div className="grid-2">
<FormGroup label="Client">
<input className="form-input" value={editForm.client || ''} onChange={e => setE('client', e.target.value)} />
</FormGroup>
<FormGroup label="Budget (₹)">
<input className="form-input" type="number" value={editForm.budget || ''} onChange={e => setE('budget', e.target.value)} />
</FormGroup>
</div>
<div className="grid-2">
<FormGroup label="Start Date">
<input className="form-input" type="date" value={editForm.start || ''} onChange={e => setE('start', e.target.value)} />
</FormGroup>
<FormGroup label="End Date">
<input className="form-input" type="date" value={editForm.end || ''} onChange={e => setE('end', e.target.value)} />
</FormGroup>
</div>
<div className="grid-2">
<FormGroup label="Team Leader">
<select className="form-select" value={editForm.leader || ''} onChange={e => setE('leader', e.target.value)}>
              {ALL_AGENTS.map(u => (
<option key={u.id}>{u.firstName} {u.lastName}</option>
              ))}
</select>
</FormGroup>
<FormGroup label="Status">
<select className="form-select" value={editForm.status || ''} onChange={e => setE('status', e.target.value)}>
              {['ACTIVE', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].map(s => (
<option key={s}>{s}</option>
              ))}
</select>
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