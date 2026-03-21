import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { StatusBadge, StatCard, Modal, FormGroup, ConfirmDialog } from '../components/UI'
import { USERS_DATA } from '../data/sampleData'

const ErrMsg = ({ msg }) => (msg ? <span className="field-error">{msg}</span> : null)
const inputClass = (err) => (err ? 'form-input input-error' : 'form-input')
const selectClass = (err) => (err ? 'form-select input-error' : 'form-select')

const PRIORITY_COLOR = {
  LOW: '#8896a8',
  MEDIUM: '#3b82f6',
  HIGH: '#E8701A',
  URGENT: '#ef4444',
}

const TYPE_ICON = {
  CALL: 'Call',
  EMAIL: 'Email',
  MEETING: 'Meeting',
  FOLLOW_UP: 'Follow Up',
  DEMO: 'Demo',
  OTHER: 'Other',
}

const EMPTY_TASK = {
  title: '',
  lead: '',
  agent: 'Ananya Rao',
  due: '',
  priority: 'HIGH',
  status: 'PENDING',
  type: 'CALL',
  desc: '',
}

const validateTaskForm = (form) => {
  const errors = {}
  if (!String(form.title || '').trim()) errors.title = 'Task title is required'
  if (!String(form.agent || '').trim()) errors.agent = 'Assignee is required'
  if (!String(form.due || '').trim()) errors.due = 'Due date is required'
  return errors
}

function TaskCard({ task, onEdit, onDelete, onToggleComplete }) {
  const isCompleted = task.status === 'COMPLETED'

  return (
    <div
      style={{
        background: 'var(--bg1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        opacity: isCompleted ? 0.7 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 12, lineHeight: 1.4, flexShrink: 0, marginTop: 1 }}>
          {TYPE_ICON[task.type] || 'Task'}
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
            {task.title}
          </div>
          {task.lead && (
            <div className="text-teal fw-600" style={{ fontSize: 12, marginTop: 2 }}>
              Lead: {task.lead}
            </div>
          )}
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.5,
            padding: '3px 8px',
            borderRadius: 99,
            flexShrink: 0,
            background: `${PRIORITY_COLOR[task.priority]}22`,
            color: PRIORITY_COLOR[task.priority],
          }}
        >
          {task.priority}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 12 }}>
        <span style={{ color: 'var(--text2)' }}>
          <span style={{ color: 'var(--text3)' }}>Agent: </span>
          <strong>{task.agent?.split(' ')[0]}</strong>
        </span>
        <span style={{ color: 'var(--text2)' }}>
          <span style={{ color: 'var(--text3)' }}>Due: </span>
          <strong className="font-mono">{task.due || '-'}</strong>
        </span>
        <span className="badge badge-blue" style={{ fontSize: 11 }}>
          {task.type}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <StatusBadge status={task.status} />
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`btn btn-icon btn-sm ${isCompleted ? 'btn-outline' : 'btn-success'}`}
            title={isCompleted ? 'Reopen Task' : 'Mark Complete'}
            onClick={() => onToggleComplete(task)}
          >
            {isCompleted ? 'Reopen' : 'Done'}
          </button>
          <button className="btn btn-outline btn-icon btn-sm" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(task.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, toast } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterAgent, setFilterAgent] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(EMPTY_TASK)

  const agents = USERS_DATA.filter((u) => u.role !== 'ADMIN')
  const filtered = tasks.filter((task) => {
    if (filterStatus && task.status !== filterStatus) return false
    if (filterAgent && task.agent !== filterAgent) return false
    return true
  })

  const stats = [
    { icon: 'P', value: tasks.filter((t) => t.status === 'PENDING').length, label: 'Pending', color: 'var(--orange)', bg: 'var(--orange-dim)' },
    { icon: 'IP', value: tasks.filter((t) => t.status === 'IN_PROGRESS').length, label: 'In Progress', color: '#3b82f6', bg: 'var(--blue-dim)' },
    { icon: 'C', value: tasks.filter((t) => t.status === 'COMPLETED').length, label: 'Completed', color: 'var(--green)', bg: 'var(--green-dim)' },
    { icon: 'X', value: tasks.filter((t) => t.status === 'CANCELLED').length, label: 'Cancelled', color: 'var(--red)', bg: 'var(--red-dim)' },
  ]

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const getAgentInitials = (agentName) =>
    agents.find((a) => `${a.firstName} ${a.lastName}` === agentName)?.initials || 'SA'

  const closeModal = () => {
    setErrors({})
    setModalOpen(false)
  }

  const openNew = () => {
    setEditTask(null)
    setErrors({})
    setForm(EMPTY_TASK)
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setErrors({})
    setForm({
      title: task.title || '',
      lead: task.lead || '',
      agent: task.agent || 'Ananya Rao',
      due: task.due || '',
      priority: task.priority || 'HIGH',
      status: task.status || 'PENDING',
      type: task.type || 'CALL',
      desc: task.desc || '',
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    const nextErrors = validateTaskForm(form)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      toast('Please fix the errors', 'error')
      return
    }

    const payload = {
      ...form,
      title: String(form.title || '').trim(),
      agent: String(form.agent || '').trim(),
      due: String(form.due || '').trim(),
      initials: getAgentInitials(form.agent),
    }

    if (editTask) {
      updateTask(editTask.id, payload)
      closeModal()
      return
    }

    if (addTask(payload)) closeModal()
  }

  const toggleTaskCompletion = (task) => {
    updateTask(task.id, { status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' })
  }

  const hasActiveFilters = filterStatus || filterAgent

  return (
    <>
      <style>{`
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
        .tasks-filter-selects {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .tasks-filter-mobile-btn {
          display: none;
        }
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
        .tasks-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        .tasks-table-desktop {
          display: block;
        }
        .tasks-card-list {
          display: none;
          flex-direction: column;
          gap: 12px;
          padding: 12px 16px;
        }
        .tasks-table-footer {
          padding: 12px 16px;
          font-size: 13px;
          color: var(--text3);
          font-weight: 600;
          border-top: 1px solid var(--border);
        }
        @media (max-width: 900px) {
          .tasks-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .tasks-page-header {
            flex-direction: column;
            align-items: stretch;
          }
          .tasks-header-right {
            justify-content: space-between;
          }
          .tasks-filter-selects {
            display: none;
          }
          .tasks-filter-mobile-btn {
            display: inline-flex;
            position: relative;
          }
          .tasks-table-desktop {
            display: none !important;
          }
          .tasks-card-list {
            display: flex !important;
          }
        }
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
        <div className="tasks-page-header page-header">
          <div>
            <h1 className="page-title">Task Management</h1>
            <p className="page-subtitle">Manage and track all team tasks</p>
          </div>
          <div className="tasks-header-right page-actions">
            <div className="tasks-filter-selects">
              <select
                className="form-select"
                style={{ width: 130 }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <select
                className="form-select"
                style={{ width: 130 }}
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
              >
                <option value="">All Agents</option>
                {agents.map((user) => (
                  <option key={user.id}>{user.firstName} {user.lastName}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-outline btn-sm tasks-filter-mobile-btn"
              onClick={() => setFiltersOpen((open) => !open)}
              style={{ position: 'relative' }}
            >
              Filters
              {hasActiveFilters && (
                <span
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--teal)',
                    border: '2px solid var(--bg1)',
                  }}
                />
              )}
            </button>

            <button className="btn btn-primary" onClick={openNew}>
              + New Task
            </button>
          </div>
        </div>

        <div className={`tasks-filter-panel ${filtersOpen ? 'open' : ''}`}>
          <select
            className="form-select"
            style={{ flex: 1, minWidth: 120 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ flex: 1, minWidth: 120 }}
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
          >
            <option value="">All Agents</option>
            {agents.map((user) => (
              <option key={user.id}>{user.firstName} {user.lastName}</option>
            ))}
          </select>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setFilterStatus('')
              setFilterAgent('')
              setFiltersOpen(false)
            }}
          >
            Clear
          </button>
        </div>

        <div className="tasks-stats-grid">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="table-wrapper">
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
                {filtered.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <span
                        className="fw-600"
                        style={task.status === 'COMPLETED' ? { textDecoration: 'line-through', opacity: 0.55 } : {}}
                      >
                        {TYPE_ICON[task.type] || task.type} {task.title}
                      </span>
                    </td>
                    <td className="text-teal fw-600">{task.lead || '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-sm">{task.initials}</div>
                        <span className="text-sm fw-600">{task.agent}</span>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{task.due}</td>
                    <td>
                      <span className="badge badge-blue">{task.type}</span>
                    </td>
                    <td>
                      <StatusBadge status={task.priority} />
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-icon btn-sm" onClick={() => openEdit(task)}>
                          Edit
                        </button>
                        <button
                          className={`btn btn-icon btn-sm ${task.status === 'COMPLETED' ? 'btn-outline' : 'btn-success'}`}
                          title={task.status === 'COMPLETED' ? 'Reopen Task' : 'Mark Complete'}
                          onClick={() => toggleTaskCompletion(task)}
                        >
                          {task.status === 'COMPLETED' ? 'Reopen' : 'Done'}
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(task.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                      No tasks found.{' '}
                      <span className="text-teal fw-700" style={{ cursor: 'pointer' }} onClick={openNew}>
                        Create one?
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="tasks-card-list">
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>
                No tasks found.{' '}
                <span className="text-teal fw-700" style={{ cursor: 'pointer' }} onClick={openNew}>
                  Create one?
                </span>
              </div>
            ) : (
              filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openEdit}
                  onDelete={setDeleteId}
                  onToggleComplete={toggleTaskCompletion}
                />
              ))
            )}
          </div>

          <div className="tasks-table-footer">
            Showing {filtered.length} task{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <Modal
          open={modalOpen}
          onClose={closeModal}
          title={editTask ? 'Edit Task' : 'New Task'}
          footer={
            <>
              <button className="btn btn-outline" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editTask ? 'Save' : 'Create Task'}
              </button>
            </>
          }
        >
          <FormGroup label="Task Title" required>
            <input
              className={inputClass(errors.title)}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Demo call with client"
            />
            <ErrMsg msg={errors.title} />
          </FormGroup>

          <div className="grid-2">
            <FormGroup label="Assign To" required>
              <select
                className={selectClass(errors.agent)}
                value={form.agent}
                onChange={(e) => setField('agent', e.target.value)}
              >
                {agents.map((user) => (
                  <option key={user.id}>{user.firstName} {user.lastName}</option>
                ))}
              </select>
              <ErrMsg msg={errors.agent} />
            </FormGroup>

            <FormGroup label="Due Date" required>
              <input
                className={inputClass(errors.due)}
                type="date"
                value={form.due}
                onChange={(e) => setField('due', e.target.value)}
              />
              <ErrMsg msg={errors.due} />
            </FormGroup>
          </div>

          <div className="grid-2">
            <FormGroup label="Priority">
              <select className="form-select" value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Status">
              <select className="form-select" value={form.status} onChange={(e) => setField('status', e.target.value)}>
                {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </FormGroup>
          </div>

          <div className="grid-2">
            <FormGroup label="Task Type">
              <select className="form-select" value={form.type} onChange={(e) => setField('type', e.target.value)}>
                {['CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'DEMO', 'OTHER'].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Lead">
              <input
                className="form-input"
                value={form.lead}
                onChange={(e) => setField('lead', e.target.value)}
                placeholder="Optional lead name"
              />
            </FormGroup>
          </div>

          <FormGroup label="Description">
            <textarea
              className="form-textarea"
              value={form.desc}
              onChange={(e) => setField('desc', e.target.value)}
              placeholder="Task details..."
            />
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
