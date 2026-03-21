import { createContext, useContext, useState, useCallback, useEffect } from 'react'
 
import {
  LEADS_DATA,
  TASKS_DATA,
  USERS_DATA,
  NOTIFICATIONS_DATA,
  PRODUCTS_DATA,
  TARGETS_DATA,
  INVOICES_DATA
} from '../data/sampleData'
 
const AppContext = createContext(null)
 
 
// ─────────────────────────────
// Persistent state helper
// ─────────────────────────────
function usePersistedState(key, defaultValue) {
 
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  })
 
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])
 
  return [state, setState]
}
 
 
// ─────────────────────────────
// APP PROVIDER
// ─────────────────────────────
export function AppProvider({ children }) {
 
  const [leads, setLeads] = usePersistedState("crm_leads", LEADS_DATA)
  const [tasks, setTasks] = usePersistedState("crm_tasks", TASKS_DATA)
  const [users, setUsers] = usePersistedState("crm_users", USERS_DATA)
 
  const [products, setProducts] = usePersistedState("crm_products", PRODUCTS_DATA)
  const [targets, setTargets] = usePersistedState("crm_targets", TARGETS_DATA)
  const [invoices, setInvoices] = usePersistedState("crm_invoices", INVOICES_DATA)
 
  const [notifications, setNotifications] = usePersistedState("crm_notifications", NOTIFICATIONS_DATA)
 
  const [currentUser] = useState(USERS_DATA[0])
  const [toasts, setToasts] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)

  useEffect(() => {
    setNotifications(prev => {
      let changed = false
      const next = prev.map((notification, index) => {
        if (notification.createdAt) return notification
        changed = true
        return {
          ...notification,
          createdAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString()
        }
      })
      return changed ? next : prev
    })
  }, [setNotifications])
 
 
  // ─────────────────────────────
  // Toast
  // ─────────────────────────────
  const toast = useCallback((msg, type = 'success') => {
 
    const id = Date.now() + Math.random()
 
    setToasts(t => [...t, { id, msg, type }])
 
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id))
    }, 3500)
 
  }, [])
 
 
  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])
 
 
  // ─────────────────────────────
  // Add Notification
  // ─────────────────────────────
  const addNotification = useCallback((title, message, type = "info") => {
 
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    }
 
    setNotifications(n => [newNotification, ...n])
 
  }, [])
 
 
  // ─────────────────────────────
  // Mark Notification Read
  // ─────────────────────────────
  const markNotifRead = useCallback((id) => {
 
    setNotifications(n =>
      n.map(x => x.id === id ? { ...x, read: true } : x)
    )
 
  }, [])
 
 
  const markAllRead = useCallback(() => {
 
    setNotifications(n =>
      n.map(x => ({ ...x, read: true }))
    )
 
  }, [])
 
 
  const unreadCount = notifications.filter(n => !n.read).length
 
 
  // ─────────────────────────────
  // Leads CRUD
  // ─────────────────────────────
  const addLead = useCallback((lead) => {
 
    const newLead = {
      ...lead,
      id: Date.now(),
      createdAt: new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
 
    setLeads(l => [newLead, ...l])
 
    toast('Lead created successfully!')
 
    addNotification(
      "New Lead Added",
      `${lead.name || "A lead"} has been created`,
      "info"
    )
 
  }, [toast, addNotification])
 
 
  const updateLead = useCallback((id, updates) => {
 
    setLeads(l =>
      l.map(x => x.id === id ? { ...x, ...updates } : x)
    )
 
    toast('Lead updated!')
 
  }, [toast])
 
 
  const deleteLead = useCallback((id) => {
 
    setLeads(l => l.filter(x => x.id !== id))
 
    toast('Lead deleted', 'warn')
 
  }, [toast])
 
 
  // ─────────────────────────────
  // Tasks CRUD
  // ─────────────────────────────
  const addTask = useCallback((task) => {
 
    const newTask = { ...task, id: Date.now() }
 
    setTasks(t => [newTask, ...t])
 
    toast('Task created!')
 
    addNotification(
      "New Task Assigned",
      `${task.title || "Task"} has been assigned`,
      "warning"
    )
 
  }, [toast, addNotification])
 
 
  const updateTask = useCallback((id, updates) => {
 
    setTasks(t =>
      t.map(x => x.id === id ? { ...x, ...updates } : x)
    )
 
    toast('Task updated!')
 
  }, [toast])
 
 
  const deleteTask = useCallback((id) => {
 
    setTasks(t => t.filter(x => x.id !== id))
 
    toast('Task deleted', 'warn')
 
  }, [toast])
 
 
  // ─────────────────────────────
  // PROVIDER
  // ─────────────────────────────
  return (
    <AppContext.Provider
      value={{
 
        leads,
        addLead,
        updateLead,
        deleteLead,
 
        tasks,
        addTask,
        updateTask,
        deleteTask,
 
        users,
        setUsers,
 
        products,
        setProducts,
 
        targets,
        setTargets,
 
        invoices,
        setInvoices,
 
        notifications,
        addNotification,
        markNotifRead,
        markAllRead,
        unreadCount,
 
        currentUser,
        selectedLead,
        setSelectedLead,
 
        toasts,
        toast,
        removeToast
 
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
 
 
// ─────────────────────────────
// useApp Hook
// ─────────────────────────────
export function useApp() {
 
  const ctx = useContext(AppContext)
 
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider')
  }
 
  return ctx
}
