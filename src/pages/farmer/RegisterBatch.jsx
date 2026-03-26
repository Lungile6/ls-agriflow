import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { PassportModal } from '../../components/common'
import { useApp } from '../../context/AppContext'
import { generateId, hashBatch, createTransaction } from '../../utils/crypto'
import { CONTRACT_NAME, TAGLINE } from '../../components/Logo'

const GRADES = ['A+', 'A', 'B', 'C']
const REGIONS = ['Quthing', 'Maseru', 'Leribe', 'Berea', 'Mafeteng', 'Mohale\'s Hoek', 'Mokhotlong', 'Thaba-Tseka', 'Butha-Buthe', 'Qacha\'s Nek']

export default function RegisterBatch() {
  const { user, db, toast } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    productType: 'Wool', weight: '', grade: 'A', region: user.district || 'Quthing',
    harvestDate: '', description: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [newBatch, setNewBatch] = useState(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  function validate() {
    const e = {}
    if (!form.weight || isNaN(form.weight) || +form.weight <= 0) e.weight = 'Enter a valid weight in kg'
    if (!form.harvestDate) e.harvestDate = 'Harvest date is required'
    if (new Date(form.harvestDate) > new Date()) e.harvestDate = 'Harvest date cannot be in the future'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600)) // simulate processing

    const batch = {
      id: generateId('BATCH'),
      farmerId: user.id,
      productType: form.productType,
      weight: parseFloat(form.weight),
      grade: form.grade,
      region: form.region,
      harvestDate: form.harvestDate,
      description: form.description.trim(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    batch.hash = hashBatch(batch)

    db.insert('batches', batch)

    const tx = createTransaction('REGISTER', batch.id, user.id, user.role, {
      note: 'Initial batch registration via farmer portal',
    })
    db.insert('transactions', tx)

    setSubmitting(false)
    toast(`Batch ${batch.id} registered successfully!`, 'success')
    setNewBatch(batch)
  }

  if (newBatch) {
    return (
      <Layout title="Register Batch">
        <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: 32, textAlign:'center' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: 8 }}>Batch Registered!</h2>
          <p className="text-muted" style={{ marginBottom: 20 }}>Your batch has been recorded on the blockchain ledger and is now awaiting agent verification.</p>
          <div style={{ background:'var(--bg)', borderRadius:'var(--radius-sm)', padding:14, marginBottom:20, textAlign:'left' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span className="text-muted">Batch ID</span>
              <span className="font-mono">{newBatch.id}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span className="text-muted">SHA-256 Hash</span>
              <span className="font-mono" style={{ fontSize:10, maxWidth:200, wordBreak:'break-all' }}>{newBatch.hash.slice(0,32)}...</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="text-muted">Status</span>
              <span style={{ color:'var(--warning)', fontWeight:600 }}>PENDING VERIFICATION</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
            <button className="btn btn-ghost" onClick={() => setNewBatch(null)}>Register Another</button>
            <button className="btn btn-primary" onClick={() => navigate('/farmer/batches')}>View My Batches</button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Register New Batch">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">📦 New Produce Batch</span>
            <span className="text-muted text-sm">Fields marked * are required</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Type *</label>
                  <select className="form-select" value={form.productType} onChange={e => set('productType', e.target.value)}>
                    <option>Wool</option>
                    <option>Mohair</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quality Grade *</label>
                  <select className="form-select" value={form.grade} onChange={e => set('grade', e.target.value)}>
                    {GRADES.map(g => <option key={g}>{g}</option>)}
                  </select>
                  <p className="form-hint">Agent may revise grade during verification</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Weight (kg) *</label>
                  <input className="form-input" type="number" min="1" step="0.1" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="e.g. 120" />
                  {errors.weight && <p className="form-error">{errors.weight}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Harvest Date *</label>
                  <input className="form-input" type="date" value={form.harvestDate} max={new Date().toISOString().split('T')[0]} onChange={e => set('harvestDate', e.target.value)} />
                  {errors.harvestDate && <p className="form-error">{errors.harvestDate}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Origin Region *</label>
                <select className="form-select" value={form.region} onChange={e => set('region', e.target.value)}>
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Fine merino wool, hand-sheared, no vegetable matter..." />
              </div>

              <div style={{ background:'var(--primary-pale)', borderRadius:'var(--radius-sm)', padding:14, marginBottom:20, fontSize:13 }}>
                <strong style={{ color:'var(--primary)' }}>ℹ Blockchain Registration</strong>
                <p style={{ color:'var(--text-secondary)', marginTop:4 }}>Submitting this form will generate a unique SHA-256 hash of your batch data and record it as an immutable transaction on the LS-AgriFlow ledger (<span style={{fontFamily:'monospace',fontSize:12}}>{CONTRACT_NAME}</span>). This creates your tamper-proof Digital Passport and Proof of Origin.</p>
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/farmer/batches')}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex:1 }} disabled={submitting}>
                  {submitting ? '⏳ Processing on ledger...' : '⛓ Register & Generate Passport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
