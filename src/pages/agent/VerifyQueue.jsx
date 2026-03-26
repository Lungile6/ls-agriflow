import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { Badge, ChainViewer } from '../../components/common'
import { useApp } from '../../context/AppContext'
import { createTransaction } from '../../utils/crypto'

const GRADES = ['A+', 'A', 'B', 'C']

export default function VerifyQueue() {
  const { user, db, toast } = useApp()
  const [pending, setPending] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ grade: 'A', notes: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState('approve')

  function reload() {
    setPending(db.where('batches', b => b.status === 'PENDING')
      .sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt)))
  }

  useEffect(() => { reload() }, [])

  function selectBatch(b) {
    setSelected(b)
    setForm({ grade: b.grade, notes: '', reason: '' })
    setTab('approve')
  }

  async function handleVerify(approve) {
    if (approve && !form.notes) { toast('Please add verification notes', 'error'); return }
    if (!approve && !form.reason) { toast('Please provide a rejection reason', 'error'); return }

    setSubmitting(true)
    await new Promise(r => setTimeout(r, 500))

    if (approve) {
      db.update('batches', selected.id, { status: 'VERIFIED', grade: form.grade, agentId: user.id })
      const tx = createTransaction('VERIFY', selected.id, user.id, user.role, { grade: form.grade, notes: form.notes })
      db.insert('transactions', tx)
      toast(`✅ Batch ${selected.id} verified with Grade ${form.grade}`, 'success')
    } else {
      db.update('batches', selected.id, { status: 'REJECTED', agentId: user.id })
      const tx = createTransaction('REJECT', selected.id, user.id, user.role, { reason: form.reason })
      db.insert('transactions', tx)
      toast(`Batch ${selected.id} rejected`, 'info')
    }

    setSubmitting(false)
    setSelected(null)
    reload()
  }

  const getFarmer = id => db.getById('users', id)
  const getTxns = batchId => db.where('transactions', t => t.batchId === batchId)

  return (
    <Layout title="Verification Queue">
      <div className="grid-2" style={{ alignItems:'start', gap:20 }}>
        {/* Queue list */}
        <div>
          <div className="section-header">
            <span className="section-title">Pending ({pending.length})</span>
          </div>
          {pending.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <div className="empty-title">Queue is clear!</div>
                <div className="empty-desc">All batches have been reviewed</div>
              </div>
            </div>
          )}
          {pending.map(b => {
            const farmer = getFarmer(b.farmerId)
            const isSelected = selected?.id === b.id
            return (
              <div
                key={b.id}
                className="card"
                onClick={() => selectBatch(b)}
                style={{
                  marginBottom:10, cursor:'pointer',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: isSelected ? 'var(--primary-pale)' : 'var(--card)',
                }}
              >
                <div className="card-body" style={{ padding:'14px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <strong style={{ fontSize:13 }}>{b.productType === 'Wool' ? '🐑' : '🐐'} {b.productType} — {b.weight} kg</strong>
                    <Badge status={b.status} />
                  </div>
                  <div className="text-sm text-muted">
                    Grade: {b.grade} · Region: {b.region}
                  </div>
                  <div className="text-sm text-muted">Farmer: {farmer?.name} · {new Date(b.createdAt).toLocaleDateString()}</div>
                  {b.description && <div className="text-sm text-muted mt-1" style={{fontStyle:'italic'}}>"{b.description}"</div>}
                  <div className="font-mono" style={{fontSize:10, color:'var(--text-muted)', marginTop:6}}>
                    SHA: {b.hash?.slice(0,40)}...
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Verification panel */}
        <div>
          {!selected ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-title">Select a batch</div>
                <div className="empty-desc">Click a batch from the queue to review it</div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ position:'sticky', top:80 }}>
              <div className="card-header">
                <span className="card-title">Review: {selected.id}</span>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div className="card-body">
                {/* Batch info */}
                <div style={{ background:'var(--bg)', borderRadius:'var(--radius-sm)', padding:14, marginBottom:16 }}>
                  {[
                    ['Product', `${selected.productType} (${selected.productType==='Wool'?'🐑':'🐐'})`],
                    ['Weight', `${selected.weight} kg`],
                    ['Declared Grade', selected.grade],
                    ['Region', selected.region],
                    ['Harvest Date', selected.harvestDate],
                    ['Description', selected.description || '—'],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                      <span className="text-muted">{k}</span><span>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Chain history */}
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:8 }}>LEDGER HISTORY</p>
                  <ChainViewer transactions={getTxns(selected.id)} showHash={false} />
                </div>

                {/* Action tabs */}
                <div style={{ display:'flex', gap:6, marginBottom:14 }}>
                  <button className={`btn ${tab==='approve'?'btn-accent':'btn-secondary'} btn-sm`} onClick={() => setTab('approve')}>✅ Approve</button>
                  <button className={`btn ${tab==='reject'?'btn-danger':'btn-secondary'} btn-sm`} onClick={() => setTab('reject')}>❌ Reject</button>
                </div>

                {tab === 'approve' && (
                  <div>
                    <div className="form-row" style={{ marginBottom:12 }}>
                      <div className="form-group" style={{ marginBottom:0 }}>
                        <label className="form-label">Confirm Grade</label>
                        <select className="form-select" value={form.grade} onChange={e => setForm(f=>({...f,grade:e.target.value}))}>
                          {GRADES.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Verification Notes *</label>
                      <textarea className="form-textarea" style={{ minHeight:70 }} value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Describe condition, any observations…" />
                    </div>
                    <button className="btn btn-accent btn-full" disabled={submitting} onClick={() => handleVerify(true)}>
                      {submitting ? '⏳ Recording on ledger...' : '✅ Verify & Record'}
                    </button>
                  </div>
                )}

                {tab === 'reject' && (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Rejection Reason *</label>
                      <textarea className="form-textarea" style={{ minHeight:70 }} value={form.reason} onChange={e => setForm(f=>({...f,reason:e.target.value}))} placeholder="Specify the reason for rejection…" />
                    </div>
                    <button className="btn btn-danger btn-full" disabled={submitting} onClick={() => handleVerify(false)}>
                      {submitting ? '⏳ Recording on ledger...' : '❌ Reject & Record'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
