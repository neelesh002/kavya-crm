# Kavya Infoweb — Sales CRM
### "Your business is our success"

A full-featured, production-ready Sales CRM built with **React 18 + Vite**, branded for **Kavya Infoweb** using the official teal (#1AABB0) and orange (#E8701A) color palette.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Demo Login:**
- Email: `admin@salescrm.com`
- Password: `Admin@123`

---

## 🏗️ Project Structure

```
kavya-crm-react/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              ← Entry point
    ├── App.jsx               ← Routes & providers
    ├── assets/
    │   └── logo.png          ← Kavya Infoweb logo
    ├── styles/
    │   ├── global.css        ← Design tokens, typography, utilities
    │   ├── components.css    ← All component styles (sidebar, header, cards, buttons, etc.)
    │   └── pages.css         ← Page-specific styles (auth, dashboard, profile, etc.)
    ├── context/
    │   ├── AppContext.jsx     ← Global state (leads, tasks, toasts, notifications)
    │   └── AuthContext.jsx   ← Auth state (login, logout, roles)
    ├── data/
    │   └── sampleData.js     ← All sample data (leads, tasks, projects, etc.)
    ├── components/
    │   ├── UI.jsx            ← Reusable: Avatar, Badge, Modal, Toast, Card, Tabs, etc.
    │   ├── Sidebar.jsx       ← Navigation sidebar with logo
    │   ├── Header.jsx        ← Top header with search & notifications
    │   └── Layout.jsx        ← Main layout wrapper
    └── pages/
        ├── AuthPage.jsx      ← Login / Register / Forgot Password
        ├── DashboardPage.jsx ← Stats, charts, activity feed, tasks
        ├── LeadsPage.jsx     ← Lead list with Table & Kanban view, CRUD
        ├── LeadDetailPage.jsx← Lead detail with timeline, calls, messages, notes
        ├── TasksPage.jsx     ← Task management with CRUD
        ├── ProjectsPage.jsx  ← Project cards with progress tracking
        └── OtherPages.jsx    ← Targets, Reports, Products, Invoices, Users, Profile, Settings
```

---

## ✨ Features

### Authentication
- JWT-ready login/register/forgot-password flow
- Role-based access: **ADMIN**, **MANAGER**, **SALES_AGENT**
- Protected & admin-only routes

### Lead Management
- Full CRUD with real-time search & multi-filter (status, source, agent)
- **Table view** with pagination
- **Kanban view** by status pipeline
- Lead scoring visualization
- Deal value tracking

### Lead Detail
- Complete activity timeline
- Tabs: Timeline · Calls · Messages · Emails · Tasks · Notes
- Call log, WhatsApp message history, email history
- Quick stats (calls, messages, emails, tasks)
- Agent assignment

### Task Management
- Full CRUD with status tracking
- Filter by status & agent
- Priority levels: LOW · MEDIUM · HIGH · URGENT
- Task types: CALL · EMAIL · MEETING · FOLLOW_UP · DEMO

### Projects
- Card-based project view
- Budget & timeline tracking
- Team resource allocation
- Progress bar visualization

### Sales Targets
- Monthly target vs achieved bar chart
- Leaderboard with rank emojis
- Incentive calculation

### Reports & Analytics
- Chart.js powered: Line, Bar, Radar charts
- Monthly revenue trend
- Lead conversion by source (radar)
- Weekly sales trend

### Products & Invoices
- Product catalog with GST calculation
- Invoice creation with line items
- Invoice statuses: DRAFT · SENT · PAID · OVERDUE

### User Management (Admin)
- User cards with role badges
- Enable/disable accounts
- Lead & call count per user

### Notifications
- Real-time notification dropdown in header
- Unread badge count
- Mark as read / mark all read

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| `--teal` | `#1AABB0` (Primary) |
| `--orange` | `#E8701A` (Accent) |
| `--font-display` | Playfair Display |
| `--font-body` | Nunito |
| `--font-mono` | JetBrains Mono |

---

## 🔌 Backend Integration

This frontend is designed to connect to the **Java Spring Boot** backend.

Update the API base URL in `src/services/api.js` (create this file):

```js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
})

// Attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      // Handle token refresh
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `chart.js` + `react-chartjs-2` | Charts & analytics |
| `lucide-react` | Icons (optional) |
| `vite` + `@vitejs/plugin-react` | Build tooling |

---

## 📱 Responsive
- ✅ Desktop (1200px+) — Full sidebar, all features
- ✅ Tablet (768px–1200px) — Responsive grids
- ✅ Mobile (<768px) — Collapsible sidebar overlay, stacked layouts

---

*Built with ❤️ for Kavya Infoweb*
