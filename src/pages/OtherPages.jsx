import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { StatCard, StatusBadge, Modal, FormGroup, ProgressBar, Card, CardHeader, ToggleSwitch } from '../components/UI'
import { TARGETS_DATA, PRODUCTS_DATA, INVOICES_DATA, USERS_DATA } from '../data/sampleData'
import { Bar, Radar, Line } from 'react-chartjs-2'
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ── shared chart options ──
const CO = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#4a5568', font: { family: 'Nunito', weight: '600', size: 12 }, boxWidth: 12 } }, tooltip: { backgroundColor: '#fff', titleColor: '#1a1f2e', bodyColor: '#4a5568', borderColor: 'rgba(0,0,0,.1)', borderWidth: 1, padding: 12 } } }
const SCALE = { x: { ticks: { color: '#8896a8', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: 'rgba(0,0,0,.04)' } }, y: { ticks: { color: '#8896a8', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: 'rgba(0,0,0,.04)' } } }
const RANK_ICONS = ['🥇', '🥈', '🥉', '4️⃣']

// ── shared validation helpers ──
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RE_PHONE = /^[+\d\s\-()\[\]]{7,15}$/
const RE_PASS = /.{8,}/

const ErrMsg = ({ msg }) => msg ? <span className="field-error">{msg}</span> : null
const ic = (err) => err ? 'form-input input-error' : 'form-input'
const sc = (err) => err ? 'form-select input-error' : 'form-select'
const tc = (err) => err ? 'form-textarea input-error' : 'form-textarea'

// ════════════════════════════════
// TARGETS PAGE
// ════════════════════════════════
export function TargetsPage() {
  const { targets, toast } = useApp()
  const [modalOpen, setModal] = useState(false)
  const [form, setForm] = useState({ agent: '', month: 'January', year: '2025', amount: '' })
  const [errors, setErrors] = useState({})
  const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.agent) e.agent = 'Please select an agent'
    if (!form.year || isNaN(form.year) || Number(form.year) < 2020 || Number(form.year) > 2099)
      e.year = 'Enter a valid year (2020–2099)'
    if (!form.amount || Number(form.amount) <= 0)
      e.amount = 'Target amount must be greater than 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) { toast('Please fix the errors', 'error'); return }
    setModal(false)
    setForm({ agent: '', month: 'January', year: '2025', amount: '' })
    setErrors({})
    toast('Target set!')
  }

  const handleClose = () => { setModal(false); setForm({ agent: '', month: 'January', year: '2025', amount: '' }); setErrors({}) }

  const chartData = {
    labels: targets.map(t => t.agent.split(' ')[0]),
    datasets: [
      { label: 'Target (₹k)', data: targets.map(t => t.target / 1000), backgroundColor: 'rgba(136,150,168,.25)', borderRadius: 7, borderSkipped: false, borderWidth: 1.5, borderColor: 'rgba(136,150,168,.5)' },
      { label: 'Achieved (₹k)', data: targets.map(t => t.achieved / 1000), backgroundColor: ['rgba(26,171,176,.7)', 'rgba(59,130,246,.7)', 'rgba(232,112,26,.7)', 'rgba(239,68,68,.5)'], borderRadius: 7, borderSkipped: false },
    ]
  }

  return (
    <div className="animate-fadeup">
      <div className="page-header">
        <div><h1 className="page-title">Sales Targets</h1><p className="page-subtitle">March 2025 performance tracking</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={() => setModal(true)}>+ Set Target</button></div>
      </div>

      <Card className="mb-4">
        <CardHeader title="Team Target vs Achieved — March 2025" actions={<span className="text-sm text-muted fw-600">Monthly Target: <strong style={{ color: 'var(--text1)' }}>₹10,00,000</strong></span>} />
        <div style={{ height: 240 }}><Bar data={chartData} options={{ ...CO, scales: SCALE }} /></div>
      </Card>

      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Rank</th><th>Agent</th><th>Target</th><th>Achieved</th><th>Progress</th><th>Incentive</th></tr></thead>
            <tbody>
              {targets.map((t, i) => {
                const pct = Math.round(t.achieved / t.target * 100)
                const col = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--teal)' : pct >= 40 ? 'var(--orange)' : 'var(--red)'
                return (
                  <tr key={t.agent}>
                    <td style={{ fontSize: 22 }}>{RANK_ICONS[i]}</td>
                    <td><div className="flex items-center gap-2"><div className="avatar avatar-sm">{t.initials}</div><span className="fw-700">{t.agent}</span></div></td>
                    <td className="font-mono fw-600">₹{t.target.toLocaleString()}</td>
                    <td className="font-mono fw-700" style={{ color: col }}>₹{t.achieved.toLocaleString()}</td>
                    <td><div className="flex items-center gap-2"><div style={{ width: 100 }}><ProgressBar value={pct} color={col} /></div><span className="font-mono text-sm fw-700" style={{ color: col }}>{pct}%</span></div></td>
                    <td className="font-mono fw-700 text-orange">{t.incentive > 0 ? `₹${t.incentive.toLocaleString()}` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={handleClose} title="🎯 Set Sales Target"
        footer={<><button className="btn btn-outline" onClick={handleClose}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Set Target</button></>}>
        <FormGroup label="Agent" required>
          <select className={sc(errors.agent)} value={form.agent} onChange={e => setF('agent', e.target.value)}>
            <option value="">— Select agent —</option>
            {USERS_DATA.filter(u => u.role !== 'ADMIN').map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>)}
          </select>
          <ErrMsg msg={errors.agent} />
        </FormGroup>
        <div className="grid-2">
          <FormGroup label="Month">
            <select className="form-select" value={form.month} onChange={e => setF('month', e.target.value)}>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Year" required>
            <input className={ic(errors.year)} value={form.year} onChange={e => setF('year', e.target.value)} placeholder="2025" />
            <ErrMsg msg={errors.year} />
          </FormGroup>
        </div>
        <FormGroup label="Target Amount (₹)" required>
          <input className={ic(errors.amount)} type="number" value={form.amount} onChange={e => setF('amount', e.target.value)} placeholder="250000" />
          <ErrMsg msg={errors.amount} />
        </FormGroup>
      </Modal>
    </div>
  )
}

// ════════════════════════════════
// REPORTS PAGE
// ════════════════════════════════
export function ReportsPage() {
  const { leads, toast } = useApp()
  const [period, setPeriod] = useState("THIS_MONTH")

  const getRevenue = () => {
    if (period === "LAST_MONTH") return [4.2, 6.1, 7.5, 0, 0, 0]
    if (period === "Q1_2025") return [3.8, 6.5, 8.4, 0, 0, 0]
    return [5.9, 7.2, 8.4, 0, 0, 0]
  }
  const getRadar = () => {
    if (period === "LAST_MONTH") return [15, 26, 10, 6, 18, 9]
    if (period === "Q1_2025") return [20, 35, 18, 10, 25, 14]
    return [18, 32, 14, 8, 21, 11]
  }
  const getTrend = () => {
    if (period === "LAST_MONTH") return { leads: [9, 13, 11, 16], deals: [2, 3, 3, 5] }
    if (period === "Q1_2025") return { leads: [10, 16, 19, 24], deals: [4, 6, 5, 9] }
    return { leads: [12, 18, 14, 22], deals: [3, 5, 4, 8] }
  }
  const getStats = () => {
    if (period === "LAST_MONTH") return {
      revenue: { value: '₹7.5L', trend: '↓ 11% vs this month', trendDir: 'down' },
      deals: { value: 14, trend: '↓ 3 vs this month', trendDir: 'down' },
      conversion: { value: '11.2%', trend: '↓ 1.4% vs this month', trendDir: 'down' },
      cycle: { value: '9.6 days', trend: '↑ 1.2 days slower', trendDir: 'down' },
    }
    if (period === "Q1_2025") return {
      revenue: { value: '₹18.7L', trend: '↑ 42% vs last quarter', trendDir: 'up' },
      deals: { value: 24, trend: '↑ 7 vs prev quarter', trendDir: 'up' },
      conversion: { value: '14.1%', trend: '↑ 3.5% improvement', trendDir: 'up' },
      cycle: { value: '7.8 days', trend: '↓ 2.4 days faster', trendDir: 'up' },
    }
    return {
      revenue: { value: '₹8.4L', trend: '↑ 23% vs last month', trendDir: 'up' },
      deals: { value: leads.filter(l => l.status === 'CLOSED').length, trend: '↑ 5 this week', trendDir: 'up' },
      conversion: { value: '12.6%', trend: '↑ 1.2% improvement', trendDir: 'up' },
      cycle: { value: '8.4 days', trend: '↓ 1.2 days faster', trendDir: 'up' },
    }
  }

  const stats = getStats()
  const trend = getTrend()

  const exportExcel = () => {
    const data = leads.map(l => ({ Name: l.name, Phone: l.phone, Company: l.company, Status: l.status, Source: l.source, Agent: l.agent, Score: l.score }))
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report")
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "CRM_Report.xlsx")
    toast("Excel exported!")
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text("CRM Sales Report", 20, 20)
    autoTable(doc, { head: [["Name", "Phone", "Company", "Status", "Source", "Agent"]], body: leads.map(l => [l.name, l.phone, l.company, l.status, l.source, l.agent]), startY: 30 })
    doc.save("CRM_Report.pdf")
    toast("PDF exported!")
  }

  const revenueData = { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'Revenue (₹L)', data: getRevenue(), backgroundColor: 'rgba(26,171,176,.6)', borderColor: '#1AABB0', borderWidth: 1.5, borderRadius: 8 }] }
  const radarData = { labels: ['Website', 'Referral', 'Social Media', 'Cold Call', 'Email Camp', 'Trade Show'], datasets: [{ label: 'Conversion %', data: getRadar(), backgroundColor: 'rgba(232,112,26,.12)', borderColor: '#E8701A', pointBackgroundColor: '#E8701A', borderWidth: 2.5 }] }
  const trendData = { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], datasets: [{ label: 'New Leads', data: trend.leads, borderColor: '#1AABB0', tension: .4, fill: false, pointBackgroundColor: '#1AABB0', borderWidth: 2.5 }, { label: 'Closed Deals', data: trend.deals, borderColor: '#E8701A', tension: .4, fill: false, pointBackgroundColor: '#E8701A', borderWidth: 2.5 }] }

  return (
    <div className="animate-fadeup">
      <div className="page-header">
        <div><h1 className="page-title">Reports & Analytics</h1><p className="page-subtitle">Deep insights into sales performance</p></div>
        <div className="page-actions">
          <select className="form-select" style={{ width: 140 }} value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="Q1_2025">Q1 2025</option>
          </select>
          <button className="btn btn-outline" onClick={exportPDF}>⬇ PDF</button>
          <button className="btn btn-orange" onClick={exportExcel}>⬇ Excel</button>
        </div>
      </div>
      <div className="stats-grid">
        {[
          { icon: '💰', label: 'Total Revenue', color: 'var(--teal)', bg: 'var(--teal-dim)', ...stats.revenue },
          { icon: '🤝', label: 'Deals Closed', color: 'var(--green)', bg: 'var(--green-dim)', ...stats.deals },
          { icon: '📊', label: 'Conversion Rate', color: 'var(--orange)', bg: 'var(--orange-dim)', ...stats.conversion },
          { icon: '⏱️', label: 'Avg Deal Cycle', color: '#7c3aed', bg: 'var(--purple-dim)', ...stats.cycle },
        ].map((s, i) => <StatCard key={i} {...s} />)}
      </div>
      <div className="grid-2 mb-4">
        <Card><CardHeader title="Monthly Revenue (2025)" /><div style={{ height: 220 }}><Bar data={revenueData} options={{ ...CO, plugins: { ...CO.plugins, legend: { display: false } }, scales: { x: SCALE.x, y: { ...SCALE.y, ticks: { ...SCALE.y.ticks, callback: v => v + 'L' } } } }} /></div></Card>
        <Card><CardHeader title="Conversion by Source" /><div style={{ height: 220 }}><Radar data={radarData} options={{ ...CO, plugins: { ...CO.plugins, legend: { display: false } }, scales: { r: { ticks: { color: '#8896a8', backdropColor: 'transparent' }, grid: { color: 'rgba(0,0,0,.07)' }, pointLabels: { color: '#4a5568', font: { family: 'Nunito', weight: '700', size: 11 } } } } }} /></div></Card>
      </div>
      <Card><CardHeader title="Weekly Sales Trend" /><div style={{ height: 220 }}><Line data={trendData} options={{ ...CO, scales: SCALE }} /></div></Card>
    </div>
  )
}

// ════════════════════════════════
// PRODUCTS PAGE
// ════════════════════════════════
export function ProductsPage() {
  const { toast } = useApp()
  const [products, setProducts] = useState(PRODUCTS_DATA)
  const [modalOpen, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', sku: '', category: 'Software', price: '', gst: 18, desc: '', active: true })
  const [errors, setErrors] = useState({})
  const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Product name is required'
    if (form.sku && !/^[A-Z0-9\-]{3,20}$/i.test(form.sku)) e.sku = 'SKU must be 3–20 alphanumeric characters'
    if (!form.category.trim()) e.category = 'Category is required'
    if (!form.price || Number(form.price) <= 0) e.price = 'Price must be greater than 0'
    if (form.gst === '' || form.gst === null || form.gst === undefined || Number(form.gst) < 0 || Number(form.gst) > 100)
      e.gst = 'GST must be between 0 and 100'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleEdit = (p) => {
    setEditId(p.id)
    setForm({ name: p.name, sku: p.sku, category: p.category, price: p.price, gst: p.gst, desc: p.desc ?? '', active: p.active })
    setErrors({})
    setModal(true)
  }

  const handleClose = () => {
    setModal(false); setEditId(null)
    setForm({ name: '', sku: '', category: 'Software', price: '', gst: 18, desc: '', active: true })
    setErrors({})
  }

  const handleSave = () => {
    if (!validate()) { toast('Please fix the errors', 'error'); return }
    const parsedPrice = parseInt(form.price) || 0
    const parsedGst = form.gst !== '' && form.gst !== null ? Number(form.gst) : 18
    if (editId) {
      setProducts(p => p.map(x => x.id === editId ? { ...x, ...form, price: parsedPrice, gst: parsedGst } : x))
      toast('Product updated!')
    } else {
      setProducts(p => [...p, { ...form, id: Date.now(), price: parsedPrice, gst: parsedGst }])
      toast('Product added!')
    }
    handleClose()
  }

  return (
    <>
      <style>{`
        .products-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
        .products-table-desktop { display: block; }
        .products-card-list { display:none; flex-direction:column; gap:12px; padding:12px 16px; }
        .product-card { background:var(--bg1); border:1px solid var(--border); border-radius:var(--r-md); padding:14px 16px; display:flex; flex-direction:column; gap:10px; }
        .product-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
        .product-card-name { font-weight:800; font-size:14.5px; line-height:1.3; flex:1; min-width:0; word-break:break-word; }
        .product-card-meta { display:flex; flex-wrap:wrap; gap:6px 16px; font-size:12.5px; color:var(--text2); }
        .product-card-prices { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:10px 12px; background:var(--bg0); border-radius:var(--r-sm); border:1px solid var(--border); }
        .product-card-actions { display:flex; align-items:center; justify-content:space-between; gap:8px; }
        @media (max-width: 768px) {
          .products-header { flex-direction:column; align-items:stretch; }
          .products-table-desktop { display:none !important; }
          .products-card-list { display:flex !important; }
        }
      `}</style>
      <div className="animate-fadeup">
        <div className="page-header products-header">
          <div><h1 className="page-title">Products</h1><p className="page-subtitle">Manage product catalog &amp; pricing</p></div>
          <div className="page-actions"><button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Product</button></div>
        </div>
        <div className="table-wrapper">
          <div className="products-table-desktop overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Product Name</th><th>SKU</th><th>Category</th><th>Base Price</th><th>GST %</th><th>Total Price</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => {
                  const total = p.price + Math.round(p.price * p.gst / 100)
                  return (
                    <tr key={p.id}>
                      <td className="fw-700">{p.name}</td>
                      <td className="font-mono text-sm text-muted">{p.sku}</td>
                      <td><span className="badge badge-blue">{p.category}</span></td>
                      <td className="font-mono fw-600">₹{p.price.toLocaleString()}</td>
                      <td className="font-mono">{p.gst}%</td>
                      <td className="font-mono fw-700 text-teal">₹{total.toLocaleString()}</td>
                      <td><StatusBadge status={p.active ? 'ACTIVE' : 'CANCELLED'} /></td>
                      <td><div className="table-actions"><button className="btn btn-outline btn-icon btn-sm" onClick={() => handleEdit(p)}>✏️</button><button className="btn btn-danger btn-icon btn-sm" onClick={() => { setProducts(pr => pr.filter(x => x.id !== p.id)); toast('Product deleted', 'warn') }}>🗑</button></div></td>
                    </tr>
                  )
                })}
                {products.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No products found. <span className="text-teal fw-700" style={{ cursor: 'pointer' }} onClick={() => setModal(true)}>Add one?</span></td></tr>}
              </tbody>
            </table>      
          </div>
          <div className="products-card-list">
            {products.length === 0
              ? <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text3)' }}>No products. <span className="text-teal fw-700" style={{ cursor: 'pointer' }} onClick={() => setModal(true)}>Add one?</span></div>
              : products.map(p => {
                const total = p.price + Math.round(p.price * p.gst / 100)
                return (
                  <div key={p.id} className="product-card">
                    <div className="product-card-top"><div className="product-card-name">{p.name}</div><StatusBadge status={p.active ? 'ACTIVE' : 'CANCELLED'} /></div>
                    <div className="product-card-meta">{p.sku && <span><span style={{ color: 'var(--text3)' }}>SKU: </span><span className="font-mono fw-600">{p.sku}</span></span>}<span className="badge badge-blue" style={{ fontSize: 11 }}>{p.category}</span></div>
                    <div className="product-card-prices">
                      <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Base</div><div className="font-mono fw-700" style={{ fontSize: 15 }}>₹{p.price.toLocaleString()}</div></div>
                      <div style={{ width: 1, height: 32, background: 'var(--border)', flexShrink: 0 }} />
                      <div style={{ flex: 1, textAlign: 'center' }}><div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>GST</div><div className="font-mono fw-700" style={{ fontSize: 15 }}>{p.gst}%</div></div>
                      <div style={{ width: 1, height: 32, background: 'var(--border)', flexShrink: 0 }} />
                      <div style={{ flex: 1, textAlign: 'right' }}><div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Total</div><div className="font-mono fw-800 text-teal" style={{ fontSize: 16 }}>₹{total.toLocaleString()}</div></div>
                    </div>
                    {p.desc && <div style={{ fontSize: 12.5, color: 'var(--text2)', lineHeight: 1.5 }}>{p.desc}</div>}
                    <div className="product-card-actions"><div style={{ fontSize: 12, color: 'var(--text3)' }}>#{p.id}</div><div style={{ display: 'flex', gap: 8 }}><button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}>✏️ Edit</button><button className="btn btn-danger btn-sm" onClick={() => { setProducts(pr => pr.filter(x => x.id !== p.id)); toast('Product deleted', 'warn') }}>🗑 Delete</button></div></div>
                  </div>
                )
              })
            }
          </div>
          <div className="table-footer"><span>{products.length} product{products.length !== 1 ? 's' : ''}</span></div>
        </div>
        <Modal open={modalOpen} onClose={handleClose} title={editId ? '✏️ Edit Product' : '📦 Add Product'}
          footer={<><button className="btn btn-outline" onClick={handleClose}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editId ? 'Save Changes' : 'Add Product'}</button></>}>
          <div className="grid-2">
            <FormGroup label="Product Name" required><input className={ic(errors.name)} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="CRM Enterprise Suite" /><ErrMsg msg={errors.name} /></FormGroup>
            <FormGroup label="SKU"><input className={ic(errors.sku)} value={form.sku} onChange={e => setF('sku', e.target.value)} placeholder="CRM-ENT-001" /><ErrMsg msg={errors.sku} /></FormGroup>
          </div>
          <div className="grid-2">
            <FormGroup label="Category" required><input className={ic(errors.category)} value={form.category} onChange={e => setF('category', e.target.value)} placeholder="Software" /><ErrMsg msg={errors.category} /></FormGroup>
            <FormGroup label="Price (₹)" required><input className={ic(errors.price)} type="number" value={form.price} onChange={e => setF('price', e.target.value)} placeholder="0" /><ErrMsg msg={errors.price} /></FormGroup>
          </div>
          <FormGroup label="GST %"><input className={ic(errors.gst)} type="number" value={form.gst} onChange={e => setF('gst', e.target.value)} placeholder="18" /><ErrMsg msg={errors.gst} /></FormGroup>
          <FormGroup label="Description"><textarea className="form-textarea" value={form.desc} onChange={e => setF('desc', e.target.value)} placeholder="Product description…" /></FormGroup>
        </Modal>
      </div>
    </>
  )
}

// ════════════════════════════════
// INVOICES PAGE
// ════════════════════════════════
export function InvoicesPage() {
  const { invoices: initialInvoices, toast } = useApp()
  const [invoices, setInvoices] = useState(initialInvoices)
  const [modalOpen, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [errors, setErrors] = useState({})

  const emptyForm = { customer: '', email: '', phone: '', due: '', address: '', sub: '', gst: '', status: 'PENDING' }
  const [form, setForm] = useState(emptyForm)
  const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.customer.trim()) e.customer = 'Customer name is required'
    if (form.email && !RE_EMAIL.test(form.email)) e.email = 'Invalid email address'
    if (form.phone && !RE_PHONE.test(form.phone)) e.phone = 'Invalid phone number'
    if (!form.due) e.due = 'Due date is required'
    if (form.due && form.due < new Date().toISOString().slice(0, 10))
      e.due = 'Due date cannot be in the past'
    if (!form.sub || Number(form.sub) <= 0) e.sub = 'Subtotal must be greater than 0'
    if (form.gst !== '' && form.gst !== null && Number(form.gst) < 0)
      e.gst = 'GST cannot be negative'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleEdit = (inv) => {
    setEditId(inv.id)
    setForm({ customer: inv.customer, email: inv.email ?? '', phone: inv.phone ?? '', due: inv.due ?? '', address: inv.address ?? '', sub: inv.sub, gst: inv.gst, status: inv.status })
    setErrors({})
    setModal(true)
  }

  const handleClose = () => { setModal(false); setEditId(null); setForm(emptyForm); setErrors({}) }

  const handleSave = (asDraft = false) => {
    if (!validate()) { toast('Please fix the errors', 'error'); return }
    const payload = { ...form, sub: Number(form.sub), gst: Number(form.gst) || 0, status: asDraft ? 'DRAFT' : form.status }
    if (editId) {
      setInvoices(list => list.map(inv => inv.id === editId ? { ...inv, ...payload } : inv))
      toast(asDraft ? 'Draft saved!' : 'Invoice updated!')
    } else {
      setInvoices(list => [...list, { ...payload, id: Date.now(), num: `INV-${String(Date.now()).slice(-4)}`, date: new Date().toISOString().slice(0, 10) }])
      toast(asDraft ? 'Saved as draft!' : 'Invoice created & sent!')
    }
    handleClose()
  }

  const downloadInvoicePDF = (inv) => {
    const doc = new jsPDF()
    doc.setFontSize(18); doc.text("Invoice", 20, 20); doc.setFontSize(12)
    doc.text(`Invoice No: ${inv.num}`, 20, 35); doc.text(`Customer: ${inv.customer}`, 20, 45)
    doc.text(`Date: ${inv.date}`, 20, 55); doc.text(`Due Date: ${inv.due ?? '—'}`, 20, 65)
    autoTable(doc, { startY: 80, head: [["Item", "Amount"]], body: [["Subtotal", `₹${inv.sub.toLocaleString()}`], ["GST", `₹${inv.gst.toLocaleString()}`], ["Total", `₹${(inv.sub + inv.gst).toLocaleString()}`]] })
    doc.save(`${inv.num}.pdf`)
    toast("Invoice PDF downloaded!")
  }

  const total = Number(form.sub || 0) + Number(form.gst || 0)

  /* =============================
     NEW: DYNAMIC CARD CALCULATIONS
  ============================== */

  const totalInvoiced = invoices.reduce(
    (sum, inv) => sum + (Number(inv.sub) + Number(inv.gst)),
    0
  )

  const collected = invoices
    .filter(inv => inv.status === "PAID")
    .reduce((sum, inv) => sum + (Number(inv.sub) + Number(inv.gst)), 0)

  const pending = invoices
    .filter(inv => inv.status === "PENDING")
    .reduce((sum, inv) => sum + (Number(inv.sub) + Number(inv.gst)), 0)

  const today = new Date().toISOString().slice(0, 10)

  const overdue = invoices
    .filter(inv => inv.status !== "PAID" && inv.due < today)
    .reduce((sum, inv) => sum + (Number(inv.sub) + Number(inv.gst)), 0)

  return (
    <div className="animate-fadeup">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Create, manage & track invoices</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setEditId(null); setModal(true) }}>
            + New Invoice
          </button>
        </div>
      </div>

      {/* UPDATED WORKING CARDS */}

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: '💰', value: `₹${totalInvoiced.toLocaleString()}`, label: 'Total Invoiced', color: 'var(--teal)', bg: 'var(--teal-dim)' },
          { icon: '✅', value: `₹${collected.toLocaleString()}`, label: 'Collected', color: 'var(--green)', bg: 'var(--green-dim)' },
          { icon: '⏳', value: `₹${pending.toLocaleString()}`, label: 'Pending', color: 'var(--orange)', bg: 'var(--orange-dim)' },
          { icon: '⚠️', value: `₹${overdue.toLocaleString()}`, label: 'Overdue', color: 'var(--red)', bg: 'var(--red-dim)' },
        ].map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* TABLE (UNCHANGED) */}

      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Subtotal</th>
                <th>GST</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="font-mono fw-700 text-teal">{inv.num}</td>
                  <td className="fw-700">{inv.customer}</td>
                  <td className="font-mono text-sm">{inv.date}</td>
                  <td className="font-mono text-sm">{inv.due}</td>
                  <td className="font-mono fw-600">₹{inv.sub.toLocaleString()}</td>
                  <td className="font-mono">₹{inv.gst.toLocaleString()}</td>
                  <td className="font-mono fw-700">₹{(inv.sub + inv.gst).toLocaleString()}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => downloadInvoicePDF(inv)}>⬇ PDF</button>
                      <button className="btn btn-outline btn-icon btn-sm" onClick={() => handleEdit(inv)}>✏️</button>
                    </div>
                  </td>
                </tr>
              ))}

              {invoices.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                    No invoices yet. 
                    <span className="text-teal fw-700" style={{ cursor: 'pointer' }} onClick={() => setModal(true)}>
                      Create one?
                    </span>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        <div className="table-footer">
          <span>{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* MODAL (UNCHANGED — YOUR EDIT WINDOW IS STILL HERE) */}

      <Modal
        open={modalOpen}
        onClose={handleClose}
        title={editId ? '✏️ Edit Invoice' : '🧾 New Invoice'}
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%' }}>
            <button className="btn btn-outline" onClick={handleClose}>Cancel</button>
            <button className="btn btn-outline" onClick={() => handleSave(true)}>Save Draft</button>
            <button className="btn btn-primary" onClick={() => handleSave(false)}>
              {editId ? 'Save Changes' : 'Create & Send'}
            </button>
          </div>
        }
      >
        <div className="grid-2">
          <FormGroup label="Customer Name" required><input className={ic(errors.customer)} value={form.customer} onChange={e => setF('customer', e.target.value)} placeholder="TechSoft Pvt Ltd" /><ErrMsg msg={errors.customer} /></FormGroup>
          <FormGroup label="Customer Email"><input className={ic(errors.email)} type="email" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="accounts@example.in" /><ErrMsg msg={errors.email} /></FormGroup>
        </div>
        <div className="grid-2">
          <FormGroup label="Phone"><input className={ic(errors.phone)} value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+91 22 4000 0000" /><ErrMsg msg={errors.phone} /></FormGroup>
          <FormGroup label="Due Date" required><input className={ic(errors.due)} type="date" value={form.due} onChange={e => setF('due', e.target.value)} /><ErrMsg msg={errors.due} /></FormGroup>
        </div>
        <FormGroup label="Billing Address"><textarea className="form-textarea" value={form.address} onChange={e => setF('address', e.target.value)} placeholder="Full billing address…" style={{ minHeight: 60 }} /></FormGroup>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <div className="grid-2">
            <FormGroup label="Subtotal (₹)" required><input className={`font-mono ${ic(errors.sub)}`} type="number" min="0" value={form.sub} onChange={e => setF('sub', e.target.value)} placeholder="49999" /><ErrMsg msg={errors.sub} /></FormGroup>
            <FormGroup label="GST (₹)"><input className={`font-mono ${ic(errors.gst)}`} type="number" min="0" value={form.gst} onChange={e => setF('gst', e.target.value)} placeholder="9000" /><ErrMsg msg={errors.gst} /></FormGroup>
          </div>
          <div className="invoice-summary">
            <div className="invoice-summary-row"><span className="text-muted fw-600">Subtotal</span><span className="font-mono">₹{Number(form.sub || 0).toLocaleString()}</span></div>
            <div className="invoice-summary-row"><span className="text-muted fw-600">GST</span><span className="font-mono">₹{Number(form.gst || 0).toLocaleString()}</span></div>
            <div className="invoice-summary-row total"><span>Total</span><span className="font-mono sum">₹{total.toLocaleString()}</span></div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ════════════════════════════════
// USERS PAGE
// ════════════════════════════════
const ROLE_CLASSES = { ADMIN: 'badge-red', MANAGER: 'badge-orange', SALES_AGENT: 'badge-teal' }
const ROLE_BG = { ADMIN: 'linear-gradient(135deg,#e53e3e,#c53030)', MANAGER: 'linear-gradient(135deg,#E8701A,#c05a10)', SALES_AGENT: 'linear-gradient(135deg,var(--teal),var(--teal-dark))' }

const validateUser = (form, isEdit = false) => {
  const e = {}
  if (!form.firstName?.trim()) e.firstName = 'First name is required'
  if (!form.lastName?.trim()) e.lastName = 'Last name is required'
  if (!form.email?.trim()) e.email = 'Email is required'
  else if (!RE_EMAIL.test(form.email)) e.email = 'Invalid email address'
  if (!isEdit && !form.password) e.password = 'Password is required'
  if (!isEdit && form.password && !RE_PASS.test(form.password)) e.password = 'Password must be at least 8 characters'
  if (isEdit && form.password && !RE_PASS.test(form.password)) e.password = 'New password must be at least 8 characters'
  if (form.phone && !RE_PHONE.test(form.phone)) e.phone = 'Invalid phone number'
  return e
}

export function UsersPage() {
  const { users, setUsers, toast } = useApp()
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'SALES_AGENT', phone: '', dept: '', designation: '' })
  const [addErrors, setAddErrors] = useState({})
  const setA = (k, v) => { setAddForm(f => ({ ...f, [k]: v })); setAddErrors(e => ({ ...e, [k]: '' })) }
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const setE = (k, v) => { setEditForm(f => ({ ...f, [k]: v })); setEditErrors(e => ({ ...e, [k]: '' })) }
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')

  const handleAdd = () => {
    const e = validateUser(addForm, false)
    if (Object.keys(e).length) { setAddErrors(e); toast('Please fix the errors', 'error'); return }
    const fn = (addForm.firstName || '').trim(); const ln = (addForm.lastName || '').trim()
    const initials = ((fn[0] || '') + (ln[0] || '')).toUpperCase() || '??'
    setUsers(u => [...u, { id: Date.now(), ...addForm, initials, active: true, leads: 0, calls: 0, dept: addForm.dept || 'Sales', designation: addForm.designation || 'Sales Executive', joinDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }])
    setAddOpen(false); setAddForm({ firstName: '', lastName: '', email: '', password: '', role: 'SALES_AGENT', phone: '', dept: '', designation: '' }); setAddErrors({}); toast('✅ User created successfully!')
  }

  const openEdit = (user) => { setEditUser(user); setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, phone: user.phone || '', dept: user.dept || '', designation: user.designation || '', password: '' }); setEditErrors({}); setEditOpen(true) }

  const handleEditSave = () => {
    const e = validateUser(editForm, true)
    if (Object.keys(e).length) { setEditErrors(e); toast('Please fix the errors', 'error'); return }
    const fn = (editForm.firstName || '').trim(); const ln = (editForm.lastName || '').trim()
    const initials = ((fn[0] || '') + (ln[0] || '')).toUpperCase() || '??'
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editForm, initials } : u))
    setEditOpen(false); setEditErrors({}); toast('✅ User updated successfully!')
  }

  const toggleUser = (user) => { setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: !u.active } : u)); toast(user.active ? `🔒 ${user.firstName} disabled` : `🔓 ${user.firstName} enabled`, user.active ? 'warn' : 'success') }
  const handleDelete = () => { setUsers(prev => prev.filter(u => u.id !== deleteUser.id)); setDeleteOpen(false); toast(`🗑️ ${deleteUser.firstName} ${deleteUser.lastName} removed`) }

  const filtered = users.filter(u => {
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email} ${u.designation}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'ALL' || u.role === filterRole
    return matchSearch && matchRole
  })

  return (
    <div className="animate-fadeup">
      <div className="page-header"><div><h1 className="page-title">User Management</h1><p className="page-subtitle">Manage team members & access control</p></div><div className="page-actions"><button className="btn btn-primary" onClick={() => setAddOpen(true)}>+ Add User</button></div></div>
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total', value: users.length, icon: '👥', color: 'var(--teal)', bg: 'var(--teal-dim)' },
          { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, icon: '🔴', color: '#e53e3e', bg: '#fff5f5' },
          { label: 'Managers', value: users.filter(u => u.role === 'MANAGER').length, icon: '🟠', color: 'var(--orange)', bg: 'var(--orange-dim)' },
          { label: 'Sales Agents', value: users.filter(u => u.role === 'SALES_AGENT').length, icon: '🟢', color: 'var(--teal)', bg: 'var(--teal-dim)' },
          { label: 'Active', value: users.filter(u => u.active).length, icon: '✅', color: 'var(--green)', bg: 'var(--green-dim)' },
          { label: 'Inactive', value: users.filter(u => !u.active).length, icon: '⛔', color: 'var(--text3)', bg: 'var(--bg1)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
            <div><div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div><div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginTop: 2 }}>{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <div className="filter-search" style={{ flex: 1, minWidth: 200 }}><span style={{ color: 'var(--text3)' }}>🔍</span><input placeholder="Search by name, email, designation…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        {['ALL', 'ADMIN', 'MANAGER', 'SALES_AGENT'].map(role => <button key={role} className={`btn btn-sm ${filterRole === role ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterRole(role)}>{role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}</button>)}
      </div>
      <div className="users-grid">
        {filtered.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: 'var(--text3)' }}><div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div><div style={{ fontWeight: 700 }}>No users found</div></div>}
        {filtered.map(u => (
          <div className="card" key={u.id} style={{ opacity: u.active ? 1 : 0.7 }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="avatar avatar-lg" style={{ background: u.active ? ROLE_BG[u.role] : 'var(--bg1)', color: u.active ? '#fff' : 'var(--text3)' }}>{u.initials}</div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div className="fw-700" style={{ fontSize: 15 }}>{u.firstName} {u.lastName}</div>
                <div className="text-sm text-muted truncate">{u.email}</div>
                <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}><span className={`badge ${ROLE_CLASSES[u.role]}`}>{u.role.replace('_', ' ')}</span><span className={`badge ${u.active ? 'badge-green' : 'badge-gray'}`}>{u.active ? 'ACTIVE' : 'INACTIVE'}</span></div>
              </div>
            </div>
            <div className="user-card-stats"><div className="user-stat-chip"><div className="val text-teal">{u.leads}</div><div className="lbl">Leads</div></div><div className="user-stat-chip"><div className="val" style={{ color: 'var(--orange)' }}>{u.calls}</div><div className="lbl">Calls</div></div></div>
            <div style={{ background: 'var(--bg0)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, border: '1px solid var(--border)' }}>
              <div className="text-sm fw-600" style={{ color: 'var(--text1)', marginBottom: 3 }}>🏢 {u.dept} · {u.designation}</div>
              <div className="text-sm fw-600 text-muted">📞 {u.phone || '—'}</div>
              <div className="text-sm fw-600 text-muted">📅 Joined: {u.joinDate}</div>
            </div>
            <div className="flex gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <button className="btn btn-outline btn-sm flex-1" onClick={() => openEdit(u)}>✏️ Edit</button>
              <button className={`btn ${u.active ? 'btn-danger' : 'btn-success'} btn-sm flex-1`} onClick={() => toggleUser(u)}>{u.active ? '🔒 Disable' : '🔓 Enable'}</button>
              <button className="btn btn-danger btn-sm btn-icon" onClick={() => { setDeleteUser(u); setDeleteOpen(true) }} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setAddErrors({}) }} title="👤 Add New User"
        footer={<><button className="btn btn-outline" onClick={() => { setAddOpen(false); setAddErrors({}) }}>Cancel</button><button className="btn btn-primary" onClick={handleAdd}>Create User</button></>}>
        <div className="grid-2"><FormGroup label="First Name" required><input className={ic(addErrors.firstName)} placeholder="John" value={addForm.firstName} onChange={e => setA('firstName', e.target.value)} /><ErrMsg msg={addErrors.firstName} /></FormGroup><FormGroup label="Last Name" required><input className={ic(addErrors.lastName)} placeholder="Doe" value={addForm.lastName} onChange={e => setA('lastName', e.target.value)} /><ErrMsg msg={addErrors.lastName} /></FormGroup></div>
        <FormGroup label="Email" required><input className={ic(addErrors.email)} type="email" placeholder="john@salescrm.com" value={addForm.email} onChange={e => setA('email', e.target.value)} /><ErrMsg msg={addErrors.email} /></FormGroup>
        <FormGroup label="Password" required><input className={ic(addErrors.password)} type="password" placeholder="Min 8 characters" value={addForm.password} onChange={e => setA('password', e.target.value)} /><ErrMsg msg={addErrors.password} /></FormGroup>
        <div className="grid-2"><FormGroup label="Role"><select className="form-select" value={addForm.role} onChange={e => setA('role', e.target.value)}><option value="SALES_AGENT">🟢 Sales Agent</option><option value="MANAGER">🟠 Manager</option><option value="ADMIN">🔴 Admin</option></select></FormGroup><FormGroup label="Phone"><input className={ic(addErrors.phone)} placeholder="+91 98765 43210" value={addForm.phone} onChange={e => setA('phone', e.target.value)} /><ErrMsg msg={addErrors.phone} /></FormGroup></div>
        <div className="grid-2"><FormGroup label="Department"><input className="form-input" placeholder="Sales" value={addForm.dept} onChange={e => setA('dept', e.target.value)} /></FormGroup><FormGroup label="Designation"><input className="form-input" placeholder="Sales Executive" value={addForm.designation} onChange={e => setA('designation', e.target.value)} /></FormGroup></div>
      </Modal>
      <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditErrors({}) }} title={`✏️ Edit — ${editUser?.firstName || ''} ${editUser?.lastName || ''}`}
        footer={<><button className="btn btn-outline" onClick={() => { setEditOpen(false); setEditErrors({}) }}>Cancel</button><button className="btn btn-primary" onClick={handleEditSave}>Save Changes</button></>}>
        {editUser && <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--teal-dim)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(26,171,176,.2)', marginBottom: 4 }}><div className="avatar avatar-md" style={{ background: ROLE_BG[editUser.role] }}>{editUser.initials}</div><div><div style={{ fontWeight: 700, fontSize: 14 }}>{editUser.firstName} {editUser.lastName}</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>{editUser.email}</div></div></div>}
        <div className="grid-2"><FormGroup label="First Name" required><input className={ic(editErrors.firstName)} value={editForm.firstName || ''} onChange={e => setE('firstName', e.target.value)} /><ErrMsg msg={editErrors.firstName} /></FormGroup><FormGroup label="Last Name" required><input className={ic(editErrors.lastName)} value={editForm.lastName || ''} onChange={e => setE('lastName', e.target.value)} /><ErrMsg msg={editErrors.lastName} /></FormGroup></div>
        <FormGroup label="Email" required><input className={ic(editErrors.email)} type="email" value={editForm.email || ''} onChange={e => setE('email', e.target.value)} /><ErrMsg msg={editErrors.email} /></FormGroup>
        <div className="grid-2"><FormGroup label="Role"><select className="form-select" value={editForm.role || ''} onChange={e => setE('role', e.target.value)}><option value="SALES_AGENT">🟢 Sales Agent</option><option value="MANAGER">🟠 Manager</option><option value="ADMIN">🔴 Admin</option></select></FormGroup><FormGroup label="Phone"><input className={ic(editErrors.phone)} value={editForm.phone || ''} onChange={e => setE('phone', e.target.value)} placeholder="+91 98765 43210" /><ErrMsg msg={editErrors.phone} /></FormGroup></div>
        <div className="grid-2"><FormGroup label="Department"><input className="form-input" value={editForm.dept || ''} onChange={e => setE('dept', e.target.value)} /></FormGroup><FormGroup label="Designation"><input className="form-input" value={editForm.designation || ''} onChange={e => setE('designation', e.target.value)} /></FormGroup></div>
        <FormGroup label="New Password (leave blank to keep current)"><input className={ic(editErrors.password)} type="password" placeholder="Min 8 characters to change…" onChange={e => setE('password', e.target.value)} /><ErrMsg msg={editErrors.password} /></FormGroup>
      </Modal>
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="🗑️ Delete User"
        footer={<><button className="btn btn-outline" onClick={() => setDeleteOpen(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button></>}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>⚠️</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Are you sure?</div>
          <div style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.7 }}>You are about to permanently delete<br /><strong style={{ color: 'var(--text1)', fontSize: 15 }}>{deleteUser?.firstName} {deleteUser?.lastName}</strong><br /><span style={{ fontSize: 12.5 }}>{deleteUser?.email}</span><br />This action cannot be undone.</div>
        </div>
      </Modal>
    </div>
  )
}

// ════════════════════════════════
// PROFILE PAGE — with working photo upload
// ════════════════════════════════
export function ProfilePage() {
  const { toast } = useApp()
  const { user } = useAuth()

  const initials = user?.initials || 'SA'
  const name = user?.name || 'System Admin'
  const email = user?.email || 'admin@salescrm.com'
  const role = user?.role || 'ADMIN'
  const dept = user?.dept || 'Administration'
  const designation = user?.designation || 'System Administrator'

  const avatarBg = role === 'ADMIN'
    ? 'linear-gradient(135deg,#e53e3e,#c53030)'
    : role === 'MANAGER'
      ? 'linear-gradient(135deg,#E8701A,#c05a10)'
      : 'linear-gradient(135deg,var(--teal),var(--teal-dark))'

  const nameParts = name.trim().split(' ')

  const [pForm, setPForm] = useState({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' '),
    email,
    phone: user?.phone || '+91 98765 00000',
    dept,
    designation,
  })

  const [pErrors, setPErrors] = useState({})
  const setP = (k, v) => {
    setPForm(f => ({ ...f, [k]: v }))
    setPErrors(e => ({ ...e, [k]: '' }))
  }

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const setPw = (k, v) => {
    setPwForm(f => ({ ...f, [k]: v }))
    setPwErrors(e => ({ ...e, [k]: '' }))
  }

  /* ───────────────── PHOTO SYSTEM FIX ───────────────── */

  const storageKey = `profilePhoto_${email}`

  const [photoUrl, setPhotoUrl] = useState(() => {
    return localStorage.getItem(storageKey) || null
  })

  const fileInputRef = useRef(null)

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast('Image must be under 2 MB', 'error')
      return
    }

    const reader = new FileReader()

    reader.onload = (ev) => {
      const img = ev.target.result

      setPhotoUrl(img)

      // store photo per user
      localStorage.setItem(storageKey, img)

      toast('Photo updated!')
    }

    reader.readAsDataURL(file)

    e.target.value = ''
  }

  /* ───────────────── PROFILE SAVE ───────────────── */

  const saveProfile = () => {
    const e = {}

    if (!pForm.firstName.trim())
      e.firstName = 'First name is required'

    if (!pForm.email.trim())
      e.email = 'Email is required'
    else if (!RE_EMAIL.test(pForm.email))
      e.email = 'Invalid email address'

    if (pForm.phone && !RE_PHONE.test(pForm.phone))
      e.phone = 'Invalid phone number'

    if (Object.keys(e).length) {
      setPErrors(e)
      toast('Please fix the errors', 'error')
      return
    }

    toast('Profile updated!')
  }

  /* ───────────────── PASSWORD SAVE ───────────────── */

  const savePassword = () => {
    const e = {}

    if (!pwForm.current)
      e.current = 'Current password is required'

    if (!pwForm.next)
      e.next = 'New password is required'
    else if (!RE_PASS.test(pwForm.next))
      e.next = 'Must be at least 8 characters'

    if (!pwForm.confirm)
      e.confirm = 'Please confirm your password'
    else if (pwForm.next !== pwForm.confirm)
      e.confirm = 'Passwords do not match'

    if (Object.keys(e).length) {
      setPwErrors(e)
      toast('Please fix the errors', 'error')
      return
    }

    toast('Password changed!')
    setPwForm({ current: '', next: '', confirm: '' })
    setPwErrors({})
  }

  return (
    <div className="animate-fadeup">

      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account & preferences</p>
        </div>
      </div>

      {/* ───────── Profile Hero ───────── */}

      <div className="profile-hero">

        <div style={{ position: 'relative', flexShrink: 0 }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255,255,255,.5)',
                display: 'block'
              }}
            />
          ) : (
            <div className="avatar avatar-xl" style={{ background: avatarBg }}>
              {initials}
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Change photo"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#fff',
              border: '2px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              cursor: 'pointer',
              lineHeight: 1,
              boxShadow: '0 1px 4px rgba(0,0,0,.15)',
            }}
          >
            📷
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
        />

        <div>
          <div className="profile-hero-name">{name}</div>
          <div className="profile-hero-email">{email}</div>

          <div className="flex gap-2 mt-3">
            <span className={`badge ${ROLE_CLASSES[role] || 'badge-teal'}`}>
              {role.replace('_', ' ')}
            </span>

            <span className="badge badge-orange">
              {dept}
            </span>
          </div>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button
            className="btn"
            style={{
              color: '#fff',
              borderColor: 'rgba(255,255,255,.35)',
              background: 'rgba(255,255,255,.12)'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Photo
          </button>
        </div>
      </div>

      {/* ───────── Forms ───────── */}

      <div className="grid-2">

        {/* Personal Info */}

        <div className="card">
          <div className="card-header">
            <span className="card-title">Personal Information</span>
          </div>

          <div className="flex flex-col gap-3">

            <div className="grid-2">

              <FormGroup label="First Name" required>
                <input
                  className={ic(pErrors.firstName)}
                  value={pForm.firstName}
                  onChange={e => setP('firstName', e.target.value)}
                />
                <ErrMsg msg={pErrors.firstName} />
              </FormGroup>

              <FormGroup label="Last Name">
                <input
                  className="form-input"
                  value={pForm.lastName}
                  onChange={e => setP('lastName', e.target.value)}
                />
              </FormGroup>

            </div>

            <FormGroup label="Email" required>
              <input
                className={ic(pErrors.email)}
                type="email"
                value={pForm.email}
                onChange={e => setP('email', e.target.value)}
              />
              <ErrMsg msg={pErrors.email} />
            </FormGroup>

            <FormGroup label="Phone">
              <input
                className={ic(pErrors.phone)}
                value={pForm.phone}
                onChange={e => setP('phone', e.target.value)}
              />
              <ErrMsg msg={pErrors.phone} />
            </FormGroup>

            <div className="grid-2">

              <FormGroup label="Department">
                <input
                  className="form-input"
                  value={pForm.dept}
                  onChange={e => setP('dept', e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Designation">
                <input
                  className="form-input"
                  value={pForm.designation}
                  onChange={e => setP('designation', e.target.value)}
                />
              </FormGroup>

            </div>

            <button
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start' }}
              onClick={saveProfile}
            >
              Save Changes
            </button>

          </div>
        </div>

        {/* Password */}

        <div className="card">

          <div className="card-header">
            <span className="card-title">Change Password</span>
          </div>

          <div className="flex flex-col gap-3">

            <FormGroup label="Current Password" required>
              <input
                className={ic(pwErrors.current)}
                type="password"
                value={pwForm.current}
                onChange={e => setPw('current', e.target.value)}
              />
              <ErrMsg msg={pwErrors.current} />
            </FormGroup>

            <FormGroup label="New Password" required>
              <input
                className={ic(pwErrors.next)}
                type="password"
                value={pwForm.next}
                onChange={e => setPw('next', e.target.value)}
              />
              <ErrMsg msg={pwErrors.next} />
            </FormGroup>

            <FormGroup label="Confirm Password" required>
              <input
                className={ic(pwErrors.confirm)}
                type="password"
                value={pwForm.confirm}
                onChange={e => setPw('confirm', e.target.value)}
              />
              <ErrMsg msg={pwErrors.confirm} />
            </FormGroup>

            <button
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start' }}
              onClick={savePassword}
            >
              Update Password
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}
// ════════════════════════════════
// SETTINGS PAGE
// ════════════════════════════════
export function SettingsPage() {
  const { toast } = useApp()
  const [settings, setSettings] = useState({ darkMode: false, compact: false, animations: true, emailNotif: true, taskReminders: true, smsAlerts: false })
  const setSetting = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const [twilio, setTwilio] = useState({ sid: '', token: '', phone: '', whatsapp: '' })
  const [twilioErr, setTwilioErr] = useState({})
  const setTw = (k, v) => { setTwilio(f => ({ ...f, [k]: v })); setTwilioErr(e => ({ ...e, [k]: '' })) }

  const [smtp, setSmtp] = useState({ host: 'smtp.gmail.com', port: '587', user: '', pass: '' })
  const [smtpErr, setSmtpErr] = useState({})
  const setSm = (k, v) => { setSmtp(f => ({ ...f, [k]: v })); setSmtpErr(e => ({ ...e, [k]: '' })) }

  const saveTwilio = () => {
    const e = {}
    if (!twilio.sid.trim()) e.sid = 'Account SID is required'
    if (!twilio.token.trim()) e.token = 'Auth Token is required'
    if (!twilio.phone.trim()) e.phone = 'Phone number is required'
    if (Object.keys(e).length) { setTwilioErr(e); toast('Please fix the Twilio errors', 'error'); return }
    toast('Twilio config saved!')
  }

  const saveSmtp = () => {
    const e = {}
    if (!smtp.host.trim()) e.host = 'SMTP host is required'
    if (!smtp.port || isNaN(smtp.port)) e.port = 'Valid port number required'
    if (!smtp.user.trim()) e.user = 'Username / email is required'
    else if (!RE_EMAIL.test(smtp.user)) e.user = 'Invalid email address'
    if (!smtp.pass.trim()) e.pass = 'App password is required'
    if (Object.keys(e).length) { setSmtpErr(e); toast('Please fix the SMTP errors', 'error'); return }
    toast('Email config saved!')
  }

  return (
    <div className="animate-fadeup">
      <div className="page-header"><div><h1 className="page-title">Settings</h1><p className="page-subtitle">System configuration & preferences</p></div></div>
      <div className="grid-2">
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-header"><span className="card-title">🎨 Appearance</span></div>
            {[['Dark Mode', 'Switch to dark theme', 'darkMode'], ['Compact Mode', 'Reduce spacing in tables', 'compact'], ['Enable Animations', 'Smooth UI transitions', 'animations']].map(([t, d, k]) => (
              <div key={k} className="toggle-row"><div className="toggle-row-text"><div className="title">{t}</div><div className="desc">{d}</div></div><ToggleSwitch on={settings[k]} onChange={v => setSetting(k, v)} /></div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">🔔 Notifications</span></div>
            {[['Email Notifications', 'emailNotif'], ['Task Reminders', 'taskReminders'], ['SMS Alerts', 'smsAlerts']].map(([t, k]) => (
              <div key={k} className="toggle-row"><div className="toggle-row-text"><div className="title">{t}</div></div><ToggleSwitch on={settings[k]} onChange={v => setSetting(k, v)} /></div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-header"><span className="card-title">📞 Twilio Config</span></div>
            <div className="flex flex-col gap-3">
              <FormGroup label="Account SID" required><input className={ic(twilioErr.sid)} value={twilio.sid} onChange={e => setTw('sid', e.target.value)} placeholder="ACxxxxxxxxxxxxxxxx" /><ErrMsg msg={twilioErr.sid} /></FormGroup>
              <FormGroup label="Auth Token" required><input className={ic(twilioErr.token)} type="password" value={twilio.token} onChange={e => setTw('token', e.target.value)} placeholder="••••••••••••••••" /><ErrMsg msg={twilioErr.token} /></FormGroup>
              <FormGroup label="Phone Number" required><input className={ic(twilioErr.phone)} value={twilio.phone} onChange={e => setTw('phone', e.target.value)} placeholder="+1 234 567 8900" /><ErrMsg msg={twilioErr.phone} /></FormGroup>
              <FormGroup label="WhatsApp Number"><input className="form-input" value={twilio.whatsapp} onChange={e => setTw('whatsapp', e.target.value)} placeholder="whatsapp:+14155238886" /></FormGroup>
              <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={saveTwilio}>Save Config</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">✉️ Email (SMTP)</span></div>
            <div className="flex flex-col gap-3">
              <FormGroup label="SMTP Host" required><input className={ic(smtpErr.host)} value={smtp.host} onChange={e => setSm('host', e.target.value)} placeholder="smtp.gmail.com" /><ErrMsg msg={smtpErr.host} /></FormGroup>
              <FormGroup label="SMTP Port" required><input className={ic(smtpErr.port)} value={smtp.port} onChange={e => setSm('port', e.target.value)} placeholder="587" /><ErrMsg msg={smtpErr.port} /></FormGroup>
              <FormGroup label="Username" required><input className={ic(smtpErr.user)} type="email" value={smtp.user} onChange={e => setSm('user', e.target.value)} placeholder="your@email.com" /><ErrMsg msg={smtpErr.user} /></FormGroup>
              <FormGroup label="App Password" required><input className={ic(smtpErr.pass)} type="password" value={smtp.pass} onChange={e => setSm('pass', e.target.value)} placeholder="App password" /><ErrMsg msg={smtpErr.pass} /></FormGroup>
              <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={saveSmtp}>Save Config</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}