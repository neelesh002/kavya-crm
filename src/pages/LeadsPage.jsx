import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { StatusBadge, ProgressBar, Modal, FormGroup, ConfirmDialog, Pagination } from '../components/UI'
import { USERS_DATA } from '../data/sampleData'

const STATUSES = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'QUALIFIED', 'CLOSED']
const SOURCES = ['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EMAIL_CAMPAIGN', 'COLD_CALL', 'TRADE_SHOW', 'OTHER']
const STATUS_DOT = { NEW: '#8896a8', CONTACTED: '#3b82f6', FOLLOW_UP: '#E8701A', QUALIFIED: '#7c3aed', CLOSED: '#1AABB0' }
const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(0, 10)
const normalizeScore = (value) => Math.min(100, Math.max(0, Number(value) || 0))

const WA_TEMPLATES = [
  { label: 'Introduction', text: (name) => `Hi ${name}! 👋 I'm reaching out from Kavya Infoweb. We offer CRM & sales automation solutions that can help grow your business. Would you be open to a quick 15-min call this week?` },
  { label: 'Follow Up', text: (name) => `Hi ${name}, just following up on our previous conversation. Have you had a chance to review the proposal? Happy to answer any questions. 😊` },
  { label: 'Demo Invite', text: (name) => `Hi ${name}! I'd love to show you a live demo of our CRM platform. It only takes 20 minutes and you'll see exactly how it fits your workflow. When works best for you?` },
  { label: 'Proposal Sent', text: (name) => `Hi ${name}, I've just sent the detailed proposal to your email. Please have a look when you get a chance, and let me know if you'd like to discuss anything. 📧` },
  { label: 'Closing', text: (name) => `Hi ${name}! I wanted to check in one last time — our offer is valid until end of this month. Would love to get you onboarded. Let me know how you'd like to proceed! 🚀` },
]

const EMAIL_TEMPLATES = [
  { label: 'Introduction', subject: (name) => `Introduction — Kavya Infoweb CRM Solutions`, body: (name, company) => `Dear ${name},\n\nI hope this email finds you well.\n\nMy name is [Your Name] from Kavya Infoweb, and I'm reaching out because we specialize in CRM and sales automation solutions tailored for businesses like ${company}.\n\nOur platform helps sales teams:\n• Track and manage leads efficiently\n• Automate follow-ups and reminders\n• Generate real-time sales reports\n• Integrate with WhatsApp & email\n\nI'd love to schedule a brief 20-minute call to understand your current workflow and show you how we can help.\n\nWould any time this week work for you?\n\nBest regards,\n[Your Name]\nKavya Infoweb` },
  { label: 'Proposal', subject: (name) => `Proposal — CRM Solution for ${name}`, body: (name, company) => `Dear ${name},\n\nThank you for your time during our recent conversation.\n\nPlease find attached our detailed proposal for ${company}. The proposal covers:\n\n1. Solution overview and features\n2. Implementation timeline (4–6 weeks)\n3. Pricing and payment terms\n4. Post-implementation support\n\nWe are confident this solution will deliver significant ROI for your team.\n\nPlease review at your convenience, and I'm happy to schedule a call to walk you through it or answer any questions.\n\nLooking forward to hearing from you.\n\nWarm regards,\n[Your Name]\nKavya Infoweb` },
  { label: 'Follow Up', subject: (name) => `Following Up — Kavya Infoweb`, body: (name, company) => `Dear ${name},\n\nI wanted to follow up on my previous email regarding CRM solutions for ${company}.\n\nI understand you're busy, so I'll keep this brief — I'd love just 15 minutes of your time to demonstrate the value we can bring to your sales team.\n\nIf you have any questions or concerns, please don't hesitate to reach out. I'm here to help.\n\nWould this week or next work for a quick call?\n\nBest,\n[Your Name]\nKavya Infoweb` },
  { label: 'Closed — Thank You', subject: (name) => `Welcome to Kavya Infoweb, ${name}!`, body: (name, company) => `Dear ${name},\n\nOn behalf of the entire Kavya Infoweb team, welcome aboard! 🎉\n\nWe're thrilled to have ${company} as our newest client and are excited to begin this journey with you.\n\nOur onboarding team will be in touch within 24 hours to schedule the kickoff call and get everything set up.\n\nIn the meantime, if you have any questions, please reach out to me directly.\n\nThank you for choosing Kavya Infoweb!\n\nWarm regards,\n[Your Name]\nKavya Infoweb` },
]

// ── Score bar ──────────────────────────────────────────────
function ScoreBar({ score }) {
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--orange)' : 'var(--red)'
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 50 }}><ProgressBar value={score} color={color} /></div>
      <span className="font-mono text-sm fw-700" style={{ color }}>{score}</span>
    </div>
  )
}

// ── Lead Card (mobile) ─────────────────────────────────────
function LeadCard({ l, onDetail, onEdit, onDelete, onCall, onWa, onEmail }) {
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
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="avatar avatar-md">{l.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="fw-700 text-teal"
            style={{ fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            onClick={() => onDetail(l)}
          >
            {l.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {l.company}
          </div>
        </div>
        <StatusBadge status={l.status} />
      </div>

      {/* Info row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 12.5 }}>
        <span className="font-mono" style={{ color: 'var(--text2)' }}>{l.phone}</span>
        <span className="badge badge-blue text-xs">{l.source}</span>
        <span style={{ color: 'var(--text3)' }}>Agent: <strong>{l.agent?.split(' ')[0]}</strong></span>
      </div>

      {/* Score + deal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ScoreBar score={l.score} />
        <span className="font-mono fw-700 text-sm" style={{ color: 'var(--green)' }}>
          ₹{(l.deal / 1000).toFixed(0)}k
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button className="btn btn-outline btn-icon btn-sm" title="Log Call" onClick={() => onCall(l)}>📞</button>
        <button className="btn btn-outline btn-icon btn-sm" title="WhatsApp / SMS" onClick={() => onWa(l)}>💬</button>
        <button className="btn btn-outline btn-icon btn-sm" title="Send Email" onClick={() => onEmail(l)}>📧</button>
        <button className="btn btn-outline btn-icon btn-sm" title="View" onClick={() => onDetail(l)}>👁</button>
        <button className="btn btn-outline btn-icon btn-sm" title="Edit" onClick={() => onEdit(l)}>✏️</button>
        <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => onDelete(l.id)}>🗑</button>
      </div>
    </div>
  )
}

const importLeads = (event, addLead, toast) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const imported = XLSX.utils.sheet_to_json(sheet)
    imported.forEach(row => {
      const initials = row.Name
        ? row.Name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
        : "NA"
      addLead({
        name: row.Name || "",
        phone: normalizePhone(row.Phone),
        email: row.Email || "",
        company: row.Company || "",
        source: row.Source || "WEBSITE",
        status: row.Status || "NEW",
        agent: row.Agent || "Ananya Rao",
        score: normalizeScore(row.Score || 50),
        deal: Number(row.Deal) || 0,
        initials
      })
    })
    toast("Leads imported successfully!", "success")
  }
  reader.readAsArrayBuffer(file)
}

// ── Lead form modal ────────────────────────────────────────
function LeadFormModal({ open, onClose, lead, onSave }) {
  const [form, setForm] = useState(lead || { name: '', phone: '', email: '', company: '', source: 'WEBSITE', status: 'NEW', agent: 'Ananya Rao', deal: '', city: '', score: 50 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const agents = USERS_DATA.filter(u => u.role !== 'ADMIN')
  const handleSubmit = e => { e.preventDefault(); onSave({ ...form, phone: normalizePhone(form.phone) }); onClose() }

  return (
    <Modal open={open} onClose={onClose} title={lead ? '✏️ Edit Lead' : '➕ New Lead'} size="lg"
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{lead ? 'Save Changes' : 'Create Lead'}</button></>}>
      <div className="grid-2">
        <FormGroup label="Full Name" required><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Rahul Mehta" required /></FormGroup>
        <FormGroup label="Company"><input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="TechSoft Pvt Ltd" /></FormGroup>
      </div>
      <div className="grid-2">
        <FormGroup label="Email"><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="rahul@example.in" /></FormGroup>
        <FormGroup label="Phone"><input className="form-input" value={form.phone} onChange={e => set('phone', normalizePhone(e.target.value))} placeholder="9876543210" inputMode="numeric" maxLength={10} /></FormGroup>
      </div>
      <div className="grid-2">
        <FormGroup label="Lead Source"><select className="form-select" value={form.source} onChange={e => set('source', e.target.value)}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></FormGroup>
        <FormGroup label="Deal Value (₹)"><input className="form-input" type="number" value={form.deal} onChange={e => set('deal', e.target.value)} placeholder="240000" /></FormGroup>
      </div>
      <div className="grid-2">
        <FormGroup label="Assign Agent"><select className="form-select" value={form.agent} onChange={e => set('agent', e.target.value)}>{agents.map(u => <option key={u.id}>{u.firstName} {u.lastName}</option>)}</select></FormGroup>
        <FormGroup label="Status"><select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></FormGroup>
      </div>
      <div className="grid-2">
        <FormGroup label="City"><input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" /></FormGroup>
        <FormGroup label="Lead Score (0–100)"><input className="form-input" type="number" min={0} max={100} value={form.score} onChange={e => set('score', normalizeScore(e.target.value))} /></FormGroup>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════
// 📞 CALL LOGGER MODAL
// ══════════════════════════════════════════
function CallModal({ open, onClose, lead, onSave, toast }) {
  const [form, setForm] = useState({
    duration: '', status: 'COMPLETED', notes: '', followUpDate: '', followUpNote: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const [calling, setCalling] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState(null)

  const startCall = () => {
    setCalling(true)
    setTimer(0)
    const iv = setInterval(() => setTimer(t => t + 1), 1000)
    setTimerInterval(iv)
  }

  const endCall = () => {
    clearInterval(timerInterval)
    setCalling(false)
    const mins = Math.floor(timer / 60)
    const secs = timer % 60
    set('duration', `${mins}m ${secs}s`)      
  }

  const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleSave = () => {
    if (!form.notes.trim()) { toast('Please add call notes before saving', 'warn'); return }
    onSave({ ...form, leadId: lead.id, leadName: lead.name, date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) })
    onClose()
    toast(`✅ Call logged for ${lead.name}`)
  }

  if (!lead) return null

  return (
    <Modal open={open} onClose={onClose} title="📞 Log Call"
      footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save Call Log</button></>}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--teal-dim)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(26,171,176,.2)' }}>
        <div className="avatar avatar-md" style={{ background: 'linear-gradient(135deg,var(--teal),var(--teal-dark))' }}>{lead.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.phone} · {lead.company}</div>
        </div>
        <a href={`tel:${lead.phone}`} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={startCall}>
          📞 Dial
        </a>
      </div>

      {calling && (
        <div style={{ textAlign: 'center', padding: '16px', background: 'var(--green-dim)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(22,163,74,.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--green)', marginBottom: 6 }}>● CALL IN PROGRESS</div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>{formatTimer(timer)}</div>
          <button className="btn btn-danger btn-sm" style={{ marginTop: 10 }} onClick={endCall}>⏹ End Call</button>
        </div>
      )}

      <div className="grid-2">
        <FormGroup label="Duration">
          <input className="form-input" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 4m 30s" />
        </FormGroup>
        <FormGroup label="Call Outcome">
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="COMPLETED">✅ Completed</option>
            <option value="NO_ANSWER">📵 No Answer</option>
            <option value="BUSY">🔴 Busy</option>
            <option value="VOICEMAIL">📬 Voicemail</option>
            <option value="WRONG_NUMBER">❌ Wrong Number</option>
          </select>
        </FormGroup>
      </div>

      <FormGroup label="Call Notes *">
        <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="What was discussed? Key points, objections, next steps…"
          style={{ minHeight: 90 }} />
      </FormGroup>

      <div style={{ padding: '12px 14px', background: 'var(--bg0)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📅 Schedule Follow-up (optional)</div>
        <div className="grid-2">
          <FormGroup label="Follow-up Date">
            <input className="form-input" type="date" value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)} />
          </FormGroup>
          <FormGroup label="Follow-up Note">
            <input className="form-input" value={form.followUpNote} onChange={e => set('followUpNote', e.target.value)} placeholder="Call back about pricing…" />
          </FormGroup>
        </div>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════
// 💬 WHATSAPP / SMS COMPOSER MODAL
// ══════════════════════════════════════════
function WhatsAppModal({ open, onClose, lead, toast }) {
  const [channel, setChannel] = useState('WHATSAPP')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [selTpl, setSelTpl] = useState(null)

  const applyTemplate = (tpl) => {
    setMessage(tpl.text(lead?.name || 'there'))
    setSelTpl(tpl.label)
  }

  const handleSend = async () => {
    if (!message.trim()) { toast('Please write a message first', 'warn'); return }
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    setSending(false)
    setSent(true)
    setTimeout(() => { setSent(false); onClose(); toast(`✅ ${channel} message sent to ${lead?.name}!`) }, 1500)
  }

  const charLimit = channel === 'SMS' ? 160 : 1000

  if (!lead) return null

  return (
    <Modal open={open} onClose={onClose} title={channel === 'WHATSAPP' ? '💬 Send WhatsApp' : '📱 Send SMS'}
      footer={
        sent
          ? <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 14, padding: '4px 0' }}>✅ Message sent!</div>
          : <><button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSend} disabled={sending || !message.trim()}>
              {sending ? '⏳ Sending…' : `Send ${channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'} →`}
            </button></>
      }>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--teal-dim)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(26,171,176,.2)', marginBottom: 4, flexWrap: 'wrap' }}>
        <div className="avatar avatar-md" style={{ background: 'linear-gradient(135deg,var(--teal),var(--teal-dark))' }}>{lead.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.phone} · {lead.company}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {['WHATSAPP', 'SMS'].map(ch => (
            <button key={ch} onClick={() => setChannel(ch)}
              className={`btn btn-sm ${channel === ch ? 'btn-primary' : 'btn-outline'}`}>
              {ch === 'WHATSAPP' ? '💬 WA' : '📱 SMS'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 7 }}>
          Quick Templates
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {WA_TEMPLATES.map(tpl => (
            <button key={tpl.label} onClick={() => applyTemplate(tpl)}
              className={`btn btn-sm ${selTpl === tpl.label ? 'btn-primary' : 'btn-outline'}`}>
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      <FormGroup label={`Message ${channel === 'SMS' ? `(${message.length}/${charLimit})` : ''}`}>
        <textarea
          className="form-textarea"
          value={message}
          onChange={e => { if (e.target.value.length <= charLimit) setMessage(e.target.value) }}
          placeholder={`Write your ${channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'} message here…`}
          style={{ minHeight: 120, fontFamily: 'inherit', lineHeight: 1.6 }}
        />
      </FormGroup>

      {channel === 'SMS' && message.length > 130 && (
        <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>
          ⚠️ Message will be split into {Math.ceil(message.length / 160)} SMS{Math.ceil(message.length / 160) > 1 ? 'es' : ''}
        </div>
      )}

      <div style={{ fontSize: 11.5, color: 'var(--text3)', fontWeight: 600 }}>
        💡 Sending via Twilio to {lead.phone}
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════
// 📧 EMAIL COMPOSER MODAL
// ══════════════════════════════════════════
function EmailModal({ open, onClose, lead, toast }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [cc, setCc] = useState('')
  const [selTpl, setSelTpl] = useState(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const applyTemplate = (tpl) => {
    setSubject(tpl.subject(lead?.name || ''))
    setBody(tpl.body(lead?.name || '', lead?.company || ''))
    setSelTpl(tpl.label)
  }

  const handleSend = async () => {
    if (!subject.trim()) { toast('Please add a subject', 'warn'); return }
    if (!body.trim()) { toast('Please write the email body', 'warn'); return }
    setSending(true)
    await new Promise(r => setTimeout(r, 1400))
    setSending(false)
    setSent(true)
    setTimeout(() => { setSent(false); onClose(); toast(`✅ Email sent to ${lead?.name}!`) }, 1500)
  }

  if (!lead) return null

  return (
    <Modal open={open} onClose={onClose} title="📧 Compose Email" size="lg"
      footer={
        sent
          ? <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 14 }}>✅ Email sent!</div>
          : <><button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSend} disabled={sending || !subject.trim() || !body.trim()}>
              {sending ? '⏳ Sending…' : 'Send Email →'}
            </button></>
      }>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg0)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', minWidth: 28 }}>To</span>
        <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg,var(--teal),var(--teal-dark))' }}>{lead.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 13.5 }}>{lead.name}</span>
          <span style={{ fontSize: 12.5, color: 'var(--text2)', marginLeft: 8, wordBreak: 'break-all' }}>&lt;{lead.email}&gt;</span>
        </div>
      </div>

      <FormGroup label="CC (optional)">
        <input className="form-input" value={cc} onChange={e => setCc(e.target.value)} placeholder="manager@company.com, team@company.com" />
      </FormGroup>

      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 7 }}>
          Email Templates
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EMAIL_TEMPLATES.map(tpl => (
            <button key={tpl.label} onClick={() => applyTemplate(tpl)}
              className={`btn btn-sm ${selTpl === tpl.label ? 'btn-primary' : 'btn-outline'}`}>
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      <FormGroup label="Subject *">
        <input className="form-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Enter email subject…" />
      </FormGroup>

      <FormGroup label="Message *">
        <textarea
          className="form-textarea"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your email here…"
          style={{ minHeight: 200, fontFamily: 'inherit', lineHeight: 1.7, fontSize: 13.5 }}
        />
      </FormGroup>

      <div style={{ fontSize: 11.5, color: 'var(--text3)', fontWeight: 600 }}>
        💡 Sending via SMTP to {lead.email}
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════
// MAIN LEADS PAGE
// ══════════════════════════════════════════
export default function LeadsPage() {
  const navigate = useNavigate()
  const { leads, addLead, updateLead, deleteLead, toast, setSelectedLead } = useApp()

  const exportLeads = () => {
    const data = leads.map(l => ({
      Name: l.name, Phone: l.phone, Email: l.email, Company: l.company,
      Source: l.source, Status: l.status, Agent: l.agent, Score: l.score, Deal: l.deal
    }))
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads")
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const file = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    saveAs(file, "CRM_Leads.xlsx")
    toast("Leads exported!", "success")
  }

  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('')
  const [sourceF, setSourceF] = useState('')
  const [agentF, setAgentF] = useState('')
  const [view, setView] = useState('table')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const PER_PAGE = 10

  // Modals
  const [modalOpen, setModal] = useState(false)
  const [editLead, setEditLead] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [callLead, setCallLead] = useState(null)
  const [waLead, setWaLead] = useState(null)
  const [emailLead, setEmailLead] = useState(null)

  const agents = [...new Set(leads.map(l => l.agent))]

  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    if (q && !l.name.toLowerCase().includes(q) && !l.email.toLowerCase().includes(q) && !l.company.toLowerCase().includes(q) && !l.phone.includes(q)) return false
    if (statusF && l.status !== statusF) return false
    if (sourceF && l.source !== sourceF) return false
    if (agentF && l.agent !== agentF) return false
    return true
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openNew = () => { setEditLead(null); setModal(true) }
  const openEdit = lead => { setEditLead(lead); setModal(true) }

  const handleSave = form => {
    const payload = { ...form, phone: normalizePhone(form.phone), score: normalizeScore(form.score) }
    if (editLead) updateLead(editLead.id, payload)
    else {
      const initials = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      addLead({ ...payload, initials, deal: Number(form.deal) || 0 })
    }
  }

  const openDetail = lead => { setSelectedLead(lead); navigate(`/leads/${lead.id}`) }

  const handleCallSave = (log) => {
    console.log('Call logged:', log)
  }

  const hasActiveFilters = statusF || sourceF || agentF
  // Mobile kanban accordion — NEW open by default
  const [openKanbanCol, setOpenKanbanCol] = useState('NEW')

  return (
    <>
      {/* ── Responsive styles injected ── */}
      <style>{`
        .leads-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .leads-page-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        /* Filter bar: desktop = single row */
        .leads-filter-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 12px 16px;
          background: var(--bg1);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          margin-bottom: 16px;
        }
        .leads-filter-search {
          flex: 1;
          min-width: 180px;
        }
        .leads-filter-toggles {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        /* Mobile filter toggle button */
        .leads-filter-mobile-toggle {
          display: none;
        }
        /* Mobile card list */
        .leads-card-list {
          display: none;
          flex-direction: column;
          gap: 12px;
          padding: 4px 0;
        }
        /* Table toolbar: space-between */
        .leads-table-toolbar {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border);
        }
        /* Kanban: desktop horizontal scroll */
        .leads-kanban-outer {
          overflow-x: auto;
          padding: 16px;
          -webkit-overflow-scrolling: touch;
        }
        .kanban-board {
          display: flex;
          gap: 14px;
          min-width: max-content;
          align-items: flex-start;
        }
        .kanban-board > div {
          width: 240px;
          flex-shrink: 0;
        }
        /* Mobile kanban: vertical accordion */
        .kanban-mobile {
          display: none;
          flex-direction: column;
          gap: 8px;
          padding: 12px 16px;
        }
        .kanban-mobile-col {
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          overflow: hidden;
          background: var(--bg1);
        }
        .kanban-mobile-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          cursor: pointer;
          user-select: none;
          background: var(--bg1);
          transition: background 0.15s;
        }
        .kanban-mobile-header:active {
          background: var(--bg0);
        }
        .kanban-mobile-body {
          border-top: 1px solid var(--border);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: var(--bg0);
        }
        .kanban-mobile-card {
          background: var(--bg1);
          border: 1px solid var(--border);
          border-radius: var(--r-sm);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .kanban-mobile-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .kanban-mobile-card-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .kanban-chevron {
          margin-left: auto;
          font-size: 11px;
          color: var(--text3);
          transition: transform 0.2s;
        }
        .kanban-chevron.open {
          transform: rotate(180deg);
        }
        /* ─── ≤ 768px: tablets / large phones ─── */
        @media (max-width: 768px) {
          /* Kanban: hide desktop horizontal board, show vertical accordion */
          .leads-kanban-outer { display: none !important; }
          .kanban-mobile { display: flex !important; }

          .leads-page-header {
            flex-direction: column;
            align-items: stretch;
          }
          .leads-page-actions {
            justify-content: flex-end;
          }
          /* Hide selects in filter bar, show toggle instead */
          .leads-filter-toggles {
            display: none;
          }
          .leads-filter-mobile-toggle {
            display: flex;
          }
          /* When open, show toggles below search */
          .leads-filter-bar.filters-open .leads-filter-toggles {
            display: flex;
            flex-basis: 100%;
            order: 3;
          }
          /* Hide data-table, show cards */
          .leads-table-desktop {
            display: none !important;
          }
          .leads-card-list {
            display: flex !important;
          }
          /* Pagination keep visible */
          .leads-pagination-row {
            padding: 12px 16px;
          }
        }
        /* ─── ≤ 480px: small phones ─── */
        @media (max-width: 480px) {
          .leads-page-actions .btn {
            font-size: 12px;
            padding: 6px 10px;
          }
          .leads-filter-bar {
            padding: 10px 12px;
          }
          .leads-table-toolbar {
            flex-wrap: wrap;
            gap: 8px;
          }
          .leads-table-toolbar .view-toggle {
            margin-left: 0 !important;
            width: 100%;
            display: flex;
            justify-content: flex-end;
          }
        }
      `}</style>

      <div className="animate-fadeup">
        {/* ── Page header ── */}
        <div className="page-header leads-page-header">
          <div>
            <h1 className="page-title">Lead Management</h1>
            <p className="page-subtitle">{leads.length} total leads · {leads.filter(l => l.status === 'CLOSED').length} closed this month</p>
          </div>
          <div className="page-actions leads-page-actions">
            <label className="btn btn-outline" style={{ cursor: "pointer" }}>
              ⬆ Import
              <input
                type="file"
                accept=".xlsx, .xls"
                style={{ display: "none" }}
                onChange={(e) => importLeads(e, addLead, toast)}
              />
            </label>
            <button className="btn btn-outline" onClick={exportLeads}>⬇ Export</button>
            <button className="btn btn-primary" onClick={openNew}>+ New Lead</button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className={`leads-filter-bar filter-bar ${filtersOpen ? 'filters-open' : ''}`}>
          {/* Search */}
          <div className="filter-search leads-filter-search">
            <span style={{ color: 'var(--text3)', fontSize: 15 }}>🔍</span>
            <input
              type="text"
              placeholder="Search name, email, company, phone…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            className="btn btn-outline btn-sm leads-filter-mobile-toggle"
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

          {/* Filter selects (hidden on mobile unless filtersOpen) */}
          <div className="leads-filter-toggles">
            <select className="form-select" style={{ width: 130 }} value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}>
              <option value="">All Status</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={sourceF} onChange={e => { setSourceF(e.target.value); setPage(1) }}>
              <option value="">All Sources</option>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={agentF} onChange={e => { setAgentF(e.target.value); setPage(1) }}>
              <option value="">All Agents</option>
              {agents.map(a => <option key={a}>{a}</option>)}
            </select>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setSearch(''); setStatusF(''); setSourceF(''); setAgentF(''); setPage(1); setFiltersOpen(false) }}
            >
              ✕ Clear
            </button>
          </div>
        </div>

        {/* ── Table / Kanban wrapper ── */}
        <div className="table-wrapper">
          {/* Toolbar */}
          <div className="table-toolbar leads-table-toolbar">
            <span className="text-sm text-muted fw-600">{filtered.length} leads found</span>
            <div className="flex gap-2 view-toggle" style={{ marginLeft: 'auto' }}>
              <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('table')}>⊞ Table</button>
              <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('kanban')}>⬛ Kanban</button>
            </div>
          </div>

          {view === 'table' ? (
            <>
              {/* ── Desktop table ── */}
              <div className="overflow-x-auto leads-table-desktop">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" style={{ accentColor: 'var(--teal)' }} /></th>
                      <th>Name</th><th>Phone</th><th>Company</th>
                      <th>Source</th><th>Status</th><th>Score</th><th>Agent</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(l => (
                      <tr key={l.id}>
                        <td><input type="checkbox" style={{ accentColor: 'var(--teal)' }} /></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="avatar avatar-sm">{l.initials}</div>
                            <span className="fw-700 text-teal" style={{ cursor: 'pointer' }} onClick={() => openDetail(l)}>{l.name}</span>
                          </div>
                        </td>
                        <td className="font-mono text-sm">{l.phone}</td>
                        <td className="fw-600">{l.company}</td>
                        <td><span className="badge badge-blue text-xs">{l.source}</span></td>
                        <td><StatusBadge status={l.status} /></td>
                        <td><ScoreBar score={l.score} /></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="avatar avatar-sm">{l.initials}</div>
                            <span className="text-sm fw-600">{l.agent?.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-outline btn-icon btn-sm" title="Log Call" onClick={() => setCallLead(l)}>📞</button>
                            <button className="btn btn-outline btn-icon btn-sm" title="WhatsApp / SMS" onClick={() => setWaLead(l)}>💬</button>
                            <button className="btn btn-outline btn-icon btn-sm" title="Send Email" onClick={() => setEmailLead(l)}>📧</button>
                            <button className="btn btn-outline btn-icon btn-sm" title="View" onClick={() => openDetail(l)}>👁</button>
                            <button className="btn btn-outline btn-icon btn-sm" title="Edit" onClick={() => openEdit(l)}>✏️</button>
                            <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => setDeleteId(l.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginated.length === 0 && (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                        No leads found. <span className="text-teal fw-700" style={{ cursor: 'pointer' }} onClick={openNew}>Create one?</span>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile card list ── */}
              <div className="leads-card-list" style={{ padding: '12px 16px' }}>
                {paginated.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                    No leads found.{' '}
                    <span className="text-teal fw-700" style={{ cursor: 'pointer' }} onClick={openNew}>Create one?</span>
                  </div>
                ) : paginated.map(l => (
                  <LeadCard
                    key={l.id}
                    l={l}
                    onDetail={openDetail}
                    onEdit={openEdit}
                    onDelete={setDeleteId}
                    onCall={setCallLead}
                    onWa={setWaLead}
                    onEmail={setEmailLead}
                  />
                ))}
              </div>

              <div className="leads-pagination-row">
                <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
              </div>
            </>
          ) : (
            <>
              {/* ── Desktop: horizontal scrollable board ── */}
              <div className="leads-kanban-outer">
                <div className="kanban-board">
                  {STATUSES.map(s => {
                    const cards = filtered.filter(l => l.status === s)
                    return (
                      <div key={s}>
                        <div className="kanban-col-header">
                          <div className="kanban-dot" style={{ background: STATUS_DOT[s] }} />
                          <span className="kanban-col-title" style={{ color: STATUS_DOT[s] }}>{s.replace('_', ' ')}</span>
                          <span className="kanban-col-count">({cards.length})</span>
                        </div>
                        {cards.map(l => (
                          <div key={l.id} className="kanban-card" onClick={() => openDetail(l)}>
                            <div className="fw-700" style={{ fontSize: 13.5, marginBottom: 3 }}>{l.name}</div>
                            <div className="text-sm text-muted mb-2">{l.company}</div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-mono text-sm fw-700 text-green">₹{(l.deal / 1000).toFixed(0)}k</span>
                              <div className="avatar avatar-sm">{l.initials}</div>
                            </div>
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                              <button className="btn btn-outline btn-icon btn-sm" style={{ fontSize: 12 }} onClick={() => setCallLead(l)} title="Call">📞</button>
                              <button className="btn btn-outline btn-icon btn-sm" style={{ fontSize: 12 }} onClick={() => setWaLead(l)} title="WhatsApp">💬</button>
                              <button className="btn btn-outline btn-icon btn-sm" style={{ fontSize: 12 }} onClick={() => setEmailLead(l)} title="Email">📧</button>
                            </div>
                          </div>
                        ))}
                        <button className="btn btn-outline btn-sm w-full kanban-add" onClick={openNew}>+ Add Lead</button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── Mobile: vertical accordion ── */}
              <div className="kanban-mobile">
                {STATUSES.map(s => {
                  const cards = filtered.filter(l => l.status === s)
                  const isOpen = openKanbanCol === s
                  return (
                    <div key={s} className="kanban-mobile-col">
                      {/* Accordion header */}
                      <div
                        className="kanban-mobile-header"
                        onClick={() => setOpenKanbanCol(isOpen ? null : s)}
                      >
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: STATUS_DOT[s], flexShrink: 0
                        }} />
                        <span style={{ fontWeight: 800, fontSize: 13, color: STATUS_DOT[s], letterSpacing: 0.5 }}>
                          {s.replace('_', ' ')}
                        </span>
                        <span style={{
                          marginLeft: 6, fontSize: 11, fontWeight: 700,
                          background: STATUS_DOT[s] + '22',
                          color: STATUS_DOT[s],
                          padding: '2px 8px', borderRadius: 99
                        }}>
                          {cards.length}
                        </span>
                        <span style={{
                          marginLeft: 'auto',
                          fontSize: 11, color: 'var(--text3)',
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                          display: 'inline-block'
                        }}>▼</span>
                      </div>

                      {/* Accordion body */}
                      {isOpen && (
                        <div className="kanban-mobile-body">
                          {cards.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text3)', fontSize: 13 }}>
                              No leads in this stage
                            </div>
                          ) : cards.map(l => (
                            <div key={l.id} className="kanban-mobile-card">
                              {/* Card top */}
                              <div className="kanban-mobile-card-top" onClick={() => openDetail(l)} style={{ cursor: 'pointer' }}>
                                <div className="avatar avatar-md" style={{ flexShrink: 0 }}>{l.initials}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div className="fw-700 text-teal" style={{ fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {l.name}
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {l.company}
                                  </div>
                                </div>
                                <span className="font-mono fw-700 text-sm" style={{ color: 'var(--green)', flexShrink: 0 }}>
                                  ₹{(l.deal / 1000).toFixed(0)}k
                                </span>
                              </div>

                              {/* Meta row */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 12 }}>
                                <span className="font-mono" style={{ color: 'var(--text2)' }}>{l.phone}</span>
                                <span style={{ color: 'var(--text3)' }}>Agent: <strong>{l.agent?.split(' ')[0]}</strong></span>
                              </div>

                              {/* Score */}
                              <ScoreBar score={l.score} />

                              {/* Actions */}
                              <div className="kanban-mobile-card-actions" onClick={e => e.stopPropagation()}>
                                <button className="btn btn-outline btn-icon btn-sm" onClick={() => setCallLead(l)} title="Call">📞</button>
                                <button className="btn btn-outline btn-icon btn-sm" onClick={() => setWaLead(l)} title="WhatsApp">💬</button>
                                <button className="btn btn-outline btn-icon btn-sm" onClick={() => setEmailLead(l)} title="Email">📧</button>
                                <button className="btn btn-outline btn-icon btn-sm" onClick={() => openEdit(l)} title="Edit">✏️</button>
                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteId(l.id)} title="Delete">🗑</button>
                              </div>
                            </div>
                          ))}
                          <button className="btn btn-outline btn-sm w-full" style={{ marginTop: 4 }} onClick={openNew}>
                            + Add Lead
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* ── All Modals ── */}
        <LeadFormModal open={modalOpen} onClose={() => setModal(false)} lead={editLead} onSave={handleSave} />

        <ConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => deleteLead(deleteId)}
          title="Delete Lead"
          message="Are you sure you want to delete this lead? This action cannot be undone."
          confirmLabel="Delete"
          danger
        />

        <CallModal open={!!callLead} onClose={() => setCallLead(null)} lead={callLead} onSave={handleCallSave} toast={toast} />
        <WhatsAppModal open={!!waLead} onClose={() => setWaLead(null)} lead={waLead} toast={toast} />
        <EmailModal open={!!emailLead} onClose={() => setEmailLead(null)} lead={emailLead} toast={toast} />
      </div>
    </>
  )
}
