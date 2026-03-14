import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import LeadsPage from './pages/LeadsPage'
import LeadDetailPage from './pages/LeadDetailPage'
import { TasksPage } from './pages/TasksPage'
import ProjectsPage from './pages/ProjectsPage'
import { TargetsPage, ReportsPage, ProductsPage, InvoicesPage, UsersPage, ProfilePage, SettingsPage } from './pages/OtherPages'

// ── Protected Route ─────────────────────────
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

// ── Public Route (redirect if already logged in) ──
function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

// ── Admin Only ───────────────────────────────
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />

      {/* Protected — with Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leads"     element={<LeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path="/tasks"     element={<TasksPage />} />
        <Route path="/projects"  element={<ProjectsPage />} />
        <Route path="/targets"   element={<TargetsPage />} />
        <Route path="/reports"   element={<ReportsPage />} />
        <Route path="/products"  element={<ProductsPage />} />
        <Route path="/invoices"  element={<InvoicesPage />} />
        <Route path="/profile"   element={<ProfilePage />} />
        <Route path="/settings"  element={<SettingsPage />} />
        {/* Admin only */}
        <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  )
}
