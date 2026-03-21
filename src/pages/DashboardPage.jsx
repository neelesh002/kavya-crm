import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { AGENT_PERFORMANCE, ACTIVITY_FEED } from '../data/sampleData'
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
)

// ══════════════════════════════════════════
// INLINE COMPONENTS
// ══════════════════════════════════════════

function StatCard({ icon, value, label, trend, trendDir, color, bg }) {
  return (
    <div style={{
      background: 'var(--bg1)',
      border: '1px solid var(--border)',
      borderLeft: `4px solid ${color}`,
      borderRadius: 'var(--r-md)',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 11,
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default',
      transition: 'box-shadow 0.18s, transform 0.18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.09)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
    >
      {/* bg glow */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color, opacity: 0.07, pointerEvents: 'none' }} />

      {/* Icon + label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 'var(--r-sm)',
          background: bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 20, flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'var(--text3)',
          textTransform: 'uppercase', letterSpacing: 0.7,
          textAlign: 'right', maxWidth: '58%', lineHeight: 1.3,
        }}>
          {label}
        </span>
      </div>

      {/* Value */}
      <div style={{
        fontSize: 30, fontWeight: 800, color: color,
        lineHeight: 1, letterSpacing: -0.5,
        fontFamily: (typeof value === 'string' && value.startsWith('₹')) ? 'var(--font-mono)' : 'inherit',
      }}>
        {value}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Trend */}
      {trend && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, fontWeight: 700,
          color: trendDir === 'up' ? 'var(--green)' : trendDir === 'down' ? 'var(--red)' : 'var(--text3)',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 18, borderRadius: '50%', fontSize: 9, flexShrink: 0,
            background: trendDir === 'up' ? 'var(--green-dim)' : trendDir === 'down' ? 'var(--red-dim)' : 'var(--bg0)',
          }}>
            {trendDir === 'up' ? '▲' : trendDir === 'down' ? '▼' : '—'}
          </span>
          <span style={{ lineHeight: 1.3 }}>{trend}</span>
        </div>
      )}
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}

function CardHeader({ title, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderBottom: '1px solid var(--border)',
      gap: 10, flexWrap: 'wrap',
    }}>
      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text1)' }}>{title}</span>
      {actions && <div>{actions}</div>}
    </div>
  )
}

function ProgressBar({ value = 0, color = 'var(--teal)' }) {
  return (
    <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, value))}%`,
        height: '100%', background: color, borderRadius: 99,
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

// ══════════════════════════════════════════
// CHART CONFIG
// ══════════════════════════════════════════

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#4a5568',
        font: { family: 'Nunito', weight: '600', size: 12 },
        boxWidth: 12, padding: 14,
      }
    },
    tooltip: {
      backgroundColor: '#fff', titleColor: '#1a1f2e',
      bodyColor: '#4a5568', borderColor: 'rgba(0,0,0,.1)',
      borderWidth: 1, padding: 12,
    }
  }
}

const SCALE_STYLE = {
  x: { ticks: { color: '#8896a8', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: 'rgba(0,0,0,.04)' } },
  y: { ticks: { color: '#8896a8', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: 'rgba(0,0,0,.04)' } },
}

// ══════════════════════════════════════════
// DASHBOARD PAGE
// ══════════════════════════════════════════

export default function DashboardPage() {
  const navigate = useNavigate()
  const { leads, tasks } = useApp()
  const [filter, setFilter] = useState('Today')
  
  const [greeting, setGreeting] = useState('')

useEffect(() => {
  const updateGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else if (hour < 21) setGreeting('Good evening')
    else setGreeting('Good night')
  }

  updateGreeting()
  const interval = setInterval(updateGreeting, 60000) // update every minute

  return () => clearInterval(interval)
}, [])

  // ── Filtered leads ──
  const filteredLeads = leads.filter(lead => {
    if (!lead.createdAt) return true
    const d = new Date(lead.createdAt), now = new Date()
    if (filter === 'Today')      return d.toDateString() === now.toDateString()
    if (filter === 'This Week')  { const w = new Date(); w.setDate(now.getDate() - 7); return d >= w }
    if (filter === 'This Month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    if (filter === 'This Year')  return d.getFullYear() === now.getFullYear()
    return true
  })

  // ── Export ──
  const exportReport = () => {
    const ws  = XLSX.utils.json_to_sheet(leads.map(l => ({ Name: l.name, Phone: l.phone, Email: l.email, Status: l.status, Source: l.source, Created: l.createdAt })))
    const wb  = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads Report')
    saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'CRM_Leads_Report.xlsx')
  }

  const pendingTasks   = tasks.filter(t => t.status === 'PENDING').slice(0, 4)

  // ── All computed from filteredLeads — react to dropdown ──
  const totalLeads     = filteredLeads.length
  const closedLeads    = filteredLeads.filter(l => l.status === 'CLOSED').length
  const contactedLeads = filteredLeads.filter(l => l.status === 'CONTACTED').length
  const qualifiedLeads = filteredLeads.filter(l => l.status === 'QUALIFIED').length
  const followUpLeads  = filteredLeads.filter(l => l.status === 'FOLLOW_UP').length
  const callsCount     = contactedLeads + followUpLeads
  const messagesCount  = filteredLeads.filter(l => l.status !== 'NEW').length
  const emailsCount    = qualifiedLeads + closedLeads
  const rawRevenue     = filteredLeads
    .filter(l => l.status === 'CLOSED')
    .reduce((sum, l) => sum + (Number(l.deal) || 0), 0)
  const revenueLabel   = rawRevenue >= 100000
    ? `₹${(rawRevenue / 100000).toFixed(1)}L`
    : rawRevenue > 0 ? `₹${(rawRevenue / 1000).toFixed(1)}K` : '₹0'

  const trendPeriod = { 'Today': 'today', 'This Week': 'this week', 'This Month': 'this month', 'This Year': 'this year' }[filter] || 'this period'

  // ── Stats ──
  const stats = [
    { icon: '👥', value: totalLeads,    label: 'Total Leads',   trend: `↑ ${totalLeads} ${trendPeriod}`,    trendDir: totalLeads > 0    ? 'up' : 'neutral', color: 'var(--teal)',   bg: 'var(--teal-dim)'   },
    { icon: '📞', value: callsCount,    label: 'Calls Made',    trend: `↑ ${callsCount} ${trendPeriod}`,    trendDir: callsCount > 0    ? 'up' : 'neutral', color: '#3b82f6',       bg: 'var(--blue-dim)'   },
    { icon: '💬', value: messagesCount, label: 'Messages Sent', trend: `↑ ${messagesCount} ${trendPeriod}`, trendDir: messagesCount > 0 ? 'up' : 'neutral', color: 'var(--orange)', bg: 'var(--orange-dim)' },
    { icon: '✉️', value: emailsCount,   label: 'Emails Sent',   trend: `↑ ${emailsCount} ${trendPeriod}`,   trendDir: emailsCount > 0   ? 'up' : 'neutral', color: '#7c3aed',       bg: 'var(--purple-dim)' },
    { icon: '🤝', value: closedLeads,   label: 'Deals Closed',  trend: `↑ ${closedLeads} ${trendPeriod}`,   trendDir: closedLeads > 0   ? 'up' : 'neutral', color: 'var(--green)',  bg: 'var(--green-dim)'  },
    { icon: '💰', value: revenueLabel,  label: 'Revenue',       trend: `↑ ${revenueLabel} ${trendPeriod}`,  trendDir: rawRevenue > 0    ? 'up' : 'neutral', color: 'var(--teal)',   bg: 'var(--teal-dim)'   },
  ]

  // ── Chart data ──
  const revenueData = {
    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Revenue (₹L)', data: [4.2, 5.1, 6.8, 5.9, 7.2, 8.4],
      borderColor: '#1AABB0', backgroundColor: 'rgba(26,171,176,.1)',
      tension: .4, fill: true,
      pointBackgroundColor: '#1AABB0', pointBorderColor: '#fff',
      pointBorderWidth: 2, pointRadius: 5, borderWidth: 2.5,
    }]
  }

  const funnelData = {
    labels: ['NEW', 'CONTACTED', 'FOLLOW UP', 'QUALIFIED', 'CLOSED'],
    datasets: [{
      label: 'Leads',
      data: [
        filteredLeads.filter(l => l.status === 'NEW').length,
        filteredLeads.filter(l => l.status === 'CONTACTED').length,
        filteredLeads.filter(l => l.status === 'FOLLOW_UP').length,
        filteredLeads.filter(l => l.status === 'QUALIFIED').length,
        filteredLeads.filter(l => l.status === 'CLOSED').length,
      ],
      backgroundColor: ['rgba(136,150,168,.5)','rgba(59,130,246,.55)','rgba(232,112,26,.6)','rgba(124,58,237,.55)','rgba(26,171,176,.65)'],
      borderColor:     ['#8896a8','#3b82f6','#E8701A','#7c3aed','#1AABB0'],
      borderWidth: 1.5, borderRadius: 7,
    }]
  }

  const sourceData = {
    labels: ['Website', 'Referral', 'Social', 'Cold Call', 'Email', 'Trade Show'],
    datasets: [{
      data: [34, 28, 19, 11, 6, 2],
      backgroundColor: ['#1AABB0','#E8701A','#3b82f6','#a78bfa','#34d399','#fb923c'],
      borderWidth: 0, hoverOffset: 5,
    }]
  }
 

  return (
    <>
      <style>{`
        /* ── Page header ── */
        .dash-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }
        .dash-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* ── Stats grid ── */
        .dash-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        /* ── Chart rows ── */
        .dash-charts-row1 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .dash-charts-row2 {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .dash-bottom-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        /* ── chart-container heights ── */
        .chart-container       { padding: 16px; height: 240px; }
        .chart-container.short { padding: 16px; height: 220px; }

        /* ── Agent table vs cards ── */
        .agent-table-wrap { display: block; }
        .agent-cards-wrap { display: none;  }
        .agent-mini-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
        }
        .agent-mini-card:last-child { border-bottom: none; }
        .agent-mini-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 14px;
          font-size: 12px;
          color: var(--text2);
          margin-bottom: 6px;
        }

        /* ── Timeline ── */
        .timeline { padding: 8px 18px; display: flex; flex-direction: column; gap: 0; }
        .timeline-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          align-items: flex-start;
        }
        .timeline-item:last-child { border-bottom: none; }
        .timeline-icon {
          width: 34px; height: 34px; border-radius: var(--r-sm);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .timeline-body  { flex: 1; min-width: 0; }
        .timeline-title { font-size: 13px; font-weight: 600; line-height: 1.4; color: var(--text1); }
        .timeline-time  { font-size: 11.5px; color: var(--text3); margin-top: 3px; }

        /* ── Tablet ≤ 1024px ── */
        @media (max-width: 1024px) {
          .dash-charts-row2 { grid-template-columns: 1fr 1fr; }
        }

        /* ── Mobile ≤ 768px ── */
        @media (max-width: 768px) {
          .dash-header        { flex-direction: column; align-items: stretch; }
          .dash-header-actions { justify-content: space-between; }
          .dash-stats-grid    { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .dash-charts-row1   { grid-template-columns: 1fr; }
          .dash-charts-row2   { grid-template-columns: 1fr; }
          .dash-bottom-row    { grid-template-columns: 1fr; }
          .agent-table-wrap   { display: none !important; }
          .agent-cards-wrap   { display: block !important; }
          .chart-container       { height: 200px; }
          .chart-container.short { height: 190px; }
        }

        /* ── Small phones ≤ 480px ── */
        @media (max-width: 480px) {
          .dash-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .dash-header-actions .btn,
          .dash-header-actions .form-select { font-size: 12px; }
        }
      `}</style>

      <div className="animate-fadeup">

        {/* ── Page Header ── */}
        <div className="page-header dash-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">{greeting}, Admin 👋 — Here's your sales overview for today</p>
          </div>
          <div className="dash-header-actions page-actions">
            <select className="form-select" style={{ width: 140 }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
            <button className="btn btn-orange" onClick={exportReport}>⬇ Export</button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="dash-stats-grid">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* ── Row 1: Revenue + Funnel ── */}
        <div className="dash-charts-row1">
          <Card>
            <CardHeader title="Revenue Trend (6 months)" actions={<span className="badge badge-teal">● Live</span>} />
            <div className="chart-container">
              <Line data={revenueData} options={{ ...CHART_DEFAULTS, scales: SCALE_STYLE }} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Lead Pipeline Funnel" actions={<span className="badge badge-orange">Pipeline</span>} />
            <div className="chart-container">
              <Bar data={funnelData} options={{ ...CHART_DEFAULTS, indexAxis: 'y', scales: SCALE_STYLE }} />
            </div>
          </Card>
        </div>

        {/* ── Row 2: Source + Agent Performance ── */}
        <div className="dash-charts-row2">
          <Card>
            <CardHeader title="Lead Sources" />
            <div className="chart-container short">
              <Doughnut data={sourceData} options={{ ...CHART_DEFAULTS, cutout: '68%' }} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Agent Performance"
              actions={<button className="btn btn-outline btn-sm" onClick={() => navigate('/reports')}>Full Report →</button>}
            />

            {/* Desktop table */}
            <div className="agent-table-wrap overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Agent</th><th>Leads</th><th>Calls</th><th>Closed</th><th>Target %</th></tr>
                </thead>
                <tbody>
                  {AGENT_PERFORMANCE.map(a => (
                    <tr key={a.name}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar avatar-sm">{a.initials}</div>
                          <span className="fw-600">{a.name}</span>
                        </div>
                      </td>
                      <td className="font-mono">{a.leads}</td>
                      <td className="font-mono">{a.calls}</td>
                      <td className="font-mono">{a.closed}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div style={{ width: 80 }}><ProgressBar value={a.target} color={a.color} /></div>
                          <span className="font-mono text-sm fw-700" style={{ color: a.color }}>{a.target}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="agent-cards-wrap">
              {AGENT_PERFORMANCE.map(a => (
                <div key={a.name} className="agent-mini-card">
                  <div className="avatar avatar-md" style={{ flexShrink: 0 }}>{a.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 5 }}>{a.name}</div>
                    <div className="agent-mini-stats">
                      <span>👥 {a.leads} leads</span>
                      <span>📞 {a.calls} calls</span>
                      <span>🤝 {a.closed} closed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}><ProgressBar value={a.target} color={a.color} /></div>
                      <span className="font-mono text-sm fw-700" style={{ color: a.color, flexShrink: 0 }}>{a.target}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Bottom Row: Activity + Tasks ── */}
        <div className="dash-bottom-row">
          <Card>
            <CardHeader title="Recent Activity" />
            <div className="timeline">
              {ACTIVITY_FEED.map((item, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div className="timeline-body">
                    <div className="timeline-title">{item.title} <strong>{item.bold}</strong></div>
                    <div className="timeline-time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Pending Tasks"
              actions={<button className="btn btn-primary btn-sm" onClick={() => navigate('/tasks')}>+ New Task</button>}
            />
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingTasks.length === 0
                ? <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 20 }}>No pending tasks! 🎉</p>
                : pendingTasks.map(t => (
                  <div key={t.id} onClick={() => navigate('/tasks')} style={{
                    background: 'var(--bg0)',
                    borderRadius: 'var(--r-sm)',
                    padding: '12px 14px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-dim)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg0)'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 3 }}>
                        📅 Due {t.due} · {t.agent}
                      </div>
                    </div>
                    <span className={`badge badge-${t.priority?.toLowerCase()}`} style={{ flexShrink: 0 }}>
                      {t.priority}
                    </span>
                  </div>
                ))
              }
            </div>
          </Card>
        </div>

      </div>
    </>
  )
}