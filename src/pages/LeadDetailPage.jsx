import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { StatusBadge, ProgressBar, Tabs, Card } from '../components/UI'
import { CALL_LOGS, MESSAGES_DATA } from '../data/sampleData'

export default function LeadDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { leads, tasks, selectedLead, toast } = useApp()
  const [activeTab, setActiveTab] = useState('timeline')
  const [note, setNote] = useState('')

  const lead = selectedLead || leads.find(l => l.id === parseInt(id, 10))
  if (!lead) return (
    <div className="animate-fadeup" style={{ textAlign:'center', padding:80 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>Search</div>
      <h2 style={{ fontFamily:'var(--font-display)' }}>Lead not found</h2>
      <button className="btn btn-primary mt-4" onClick={() => navigate('/leads')}>Back to Leads</button>
    </div>
  )

  const scoreColor = lead.score >= 70 ? 'var(--green)' : lead.score >= 40 ? 'var(--orange)' : 'var(--red)'
  const callLogs = CALL_LOGS.filter(c => c.leadId === lead.id)
  const messageLogs = MESSAGES_DATA.filter(m => m.leadId === lead.id)
  const emailLogs = []
  const taskLogs = tasks.filter(t => t.leadId === lead.id || t.lead === lead.name)
  const tabs = [
    { key:'timeline', label:'Timeline' },
    { key:'calls', label:`Calls (${callLogs.length})` },
    { key:'messages', label:`Messages (${messageLogs.length})` },
    { key:'emails', label:`Emails (${emailLogs.length})` },
    { key:'tasks', label:`Tasks (${taskLogs.length})` },
    { key:'notes', label:'Notes' },
  ]

  const timeline = [
    { icon:'Call', bg:'var(--teal-dim)', title:'Call Made', note:'4min 28sec - Completed', time:'Today, 10:35 AM' },
    { icon:'Msg', bg:'var(--orange-dim)', title:'WhatsApp Sent', note:'Delivered', time:'Today, 10:10 AM', msg:'Hi! Please find the proposal attached. Looking forward to your feedback!' },
    { icon:'Mail', bg:'var(--blue-dim)', title:'Email: Follow-up Proposal', time:'Yesterday, 04:20 PM' },
    { icon:'Task', bg:'var(--purple-dim)', title:'Task Created: Demo call scheduled', time:'Yesterday, 11:00 AM' },
    { icon:'Note', bg:'var(--green-dim)', title:'Status changed: NEW to CONTACTED', time:'Mar 1, 03:00 PM' },
  ]

  return (
    <div className="animate-fadeup">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/leads')}>Back</button>
            <span className="text-muted text-sm">Leads /</span>
            <span className="text-sm fw-700">{lead.name}</span>
          </div>
          <h1 className="page-title">{lead.name}</h1>
          <p className="page-subtitle">{lead.company} - {lead.city || 'Mumbai'}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => toast(`Calling ${lead.name}...`)}>Call</button>
          <button className="btn btn-orange" onClick={() => toast('WhatsApp opened')}>WhatsApp</button>
          <button className="btn btn-outline" onClick={() => toast('Email opened', 'info')}>Email</button>
          <button className="btn btn-primary" onClick={() => navigate('/leads')}>Edit Lead</button>
        </div>
      </div>

      <div className="lead-detail-layout">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="card-header">
              <span className="card-title">Lead Information</span>
              <StatusBadge status={lead.status} />
            </div>
            {[
              ['Name', lead.name],
              ['Email', <span style={{ color:'var(--teal)' }}>{lead.email}</span>],
              ['Phone', lead.phone],
              ['Company', lead.company],
              ['City', lead.city || 'Mumbai'],
              ['Source', <span className="badge badge-blue">{lead.source}</span>],
              ['Deal Value', <span className="fw-700 text-green">Rs {(lead.deal || 0).toLocaleString()}</span>],
              ['Created', lead.createdAt],
            ].map(([k, v]) => (
              <div key={k} className="lead-info-row">
                <span className="lead-info-label">{k}</span>
                <span className="lead-info-value">{v}</span>
              </div>
            ))}
            <div style={{ marginTop:12 }}>
              <div className="text-sm text-muted fw-700 mb-2">Lead Score</div>
              <div className="flex items-center gap-2">
                <div style={{ flex:1 }}><ProgressBar value={lead.score} color={scoreColor} /></div>
                <span className="font-mono fw-700" style={{ fontSize:13, color:scoreColor }}>{lead.score}/100</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="card-header">
              <span className="card-title">Assigned Agent</span>
              <button className="btn btn-outline btn-sm">Reassign</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="avatar avatar-md">{lead.initials}</div>
              <div>
                <div className="fw-700">{lead.agent}</div>
                <div className="text-sm text-muted">Sales Agent</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="card-header"><span className="card-title">Activity Stats</span></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                [String(callLogs.length), 'Calls', 'var(--teal)'],
                [String(messageLogs.length), 'Messages', 'var(--orange)'],
                [String(emailLogs.length), 'Emails', '#3b82f6'],
                [String(taskLogs.length), 'Tasks', '#7c3aed'],
              ].map(([v, l, c]) => (
                <div key={l} style={{ background:'var(--bg0)', borderRadius:'var(--r-sm)', padding:10, textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:800, color:c, fontFamily:'var(--font-mono)' }}>{v}</div>
                  <div className="text-xs text-muted fw-700" style={{ marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

          {activeTab === 'timeline' && (
            <div className="timeline">
              {timeline.map((item, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-icon" style={{ background: item.bg }}>{item.icon}</div>
                  <div className="timeline-body">
                    <div className="timeline-title">
                      {item.title}
                      {item.note && <span className="text-muted fw-400"> - {item.note}</span>}
                    </div>
                    <div className="timeline-time">{item.time}</div>
                    {item.msg && <div className="timeline-note">{item.msg}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Date & Time</th><th>Duration</th><th>Status</th><th>Notes</th><th>Recording</th></tr></thead>
                <tbody>
                  {callLogs.map(c => (
                    <tr key={c.id}>
                      <td className="font-mono text-sm">{c.date}, {c.time}</td>
                      <td className="font-mono">{c.duration}</td>
                      <td><StatusBadge status={c.status === 'COMPLETED' ? 'COMPLETED' : 'CANCELLED'} /></td>
                      <td className="text-sm text-muted">{c.notes || '-'}</td>
                      <td><button className="btn btn-outline btn-sm" onClick={() => toast('Playing recording...')}>Play</button></td>
                    </tr>
                  ))}
                  {callLogs.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign:'center', padding:28, color:'var(--text3)' }}>No call logs yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="flex flex-col gap-3">
              {messageLogs.map(m => (
                <div key={m.id} style={{ background:'var(--bg0)', borderRadius:'var(--r)', padding:'13px 15px', border:'1px solid var(--border)' }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm fw-700 text-orange">{m.type} - {m.status}</span>
                    <span className="font-mono text-xs text-muted">{m.date}</span>
                  </div>
                  <p style={{ fontSize:13.5, fontWeight:500 }}>{m.content}</p>
                </div>
              ))}
              {messageLogs.length === 0 && (
                <p style={{ color:'var(--text3)', textAlign:'center', padding:28 }}>No messages yet</p>
              )}
            </div>
          )}

          {activeTab === 'emails' && (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Subject</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {emailLogs.map((email, index) => (
                    <tr key={email.id || index}>
                      <td>{email.subject}</td>
                      <td className="font-mono text-sm">{email.date}</td>
                      <td><StatusBadge status={email.status} /></td>
                    </tr>
                  ))}
                  {emailLogs.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign:'center', padding:28, color:'var(--text3)' }}>No emails yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="flex flex-col gap-3">
              {taskLogs.map((t, i) => (
                <div key={t.id || i} style={{ background:'var(--bg0)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
                  <input type="checkbox" style={{ accentColor:'var(--teal)', width:16, height:16 }} />
                  <div style={{ flex:1 }}>
                    <div className="fw-700" style={{ fontSize:13.5 }}>{t.title}</div>
                    <div className="text-xs text-muted mt-1">Due: {t.due || '-'}</div>
                  </div>
                  <span className={`badge badge-${t.priority || 'MEDIUM'}`}>{t.priority || 'MEDIUM'}</span>
                </div>
              ))}
              {taskLogs.length === 0 && (
                <p style={{ color:'var(--text3)', textAlign:'center', padding:28 }}>No tasks yet</p>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <div className="form-group mb-4">
                <label className="form-label">Add Note</label>
                <textarea className="form-textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Write a note about this lead..." />
                <button className="btn btn-primary btn-sm mt-2" onClick={() => { toast('Note saved!'); setNote('') }}>Save Note</button>
              </div>
              <div style={{ background:'var(--bg0)', borderRadius:'var(--r)', padding:'13px 15px', border:'1px solid var(--border)' }}>
                <div className="font-mono text-xs text-muted mb-2">Mar 4 - Ananya Rao</div>
                <p style={{ fontSize:13.5, fontWeight:500, lineHeight:1.6 }}>Lead is very interested in the Enterprise plan. Has budget approval for Rs 2.5L. Decision expected by end of March.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
