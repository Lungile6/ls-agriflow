import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Badge } from '../../components/common'
import { useApp } from '../../context/AppContext'
import { generateId, createTransaction } from '../../utils/crypto'

export default function MyListings() {
  const { user, db, toast } = useApp()
  const location = useLocation()
  const [listings, setListings] = useState([])
  const [verifiedBatches, setVerifiedBatches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ batchId: '', price: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  function reload() {
    const all = db.where('listings', l => l.farmerId === user.id)
    setListings(all.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)))
    // unlisted verified batches only
    const listed = new Set(all.map(l => l.batchId))
    const vb = db.where('batches', b => b.farmerId === user.id && b.status === 'VERIFIED' && !listed.has(b.id))
    setVerifiedBatches(vb)
  }

  useEffect(() => {
    reload()
    if (location.state?.batchId) {
      setForm(f => ({ ...f, batchId: location.state.batchId }))
      setShowForm(true)
    }
  }, [user.id])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.batchId || !form.price || isNaN(form.price) || +form.price <= 0) {
      toast('Please select a batch and enter a valid price', 'error'); return
    }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 400))

    const listing = {
      id: generateId('LST'),
      batchId: form.batchId,
      farmerId: user.id,
      price: parseFloat(form.price),
      currency: 'LSL',
      description: form.description.trim(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    }
    db.insert('listings', listing)
    db.update('batches', form.batchId, { status: 'LISTED' })

    const tx = createTransaction('LIST', form.batchId, user.id, user.role, {
      listingId: listing.id, price: listing.price,
    })
    db.insert('transactions', tx)

    setSubmitting(false)
    toast('Listing published to marketplace!', 'success')
    setForm({ batchId: '', price: '', description: '' })
    setShowForm(false)
    reload()
  }

  function handleRemove(listing) {
    db.update('listings', listing.id, { status: 'REMOVED' })
    db.update('batches', listing.batchId, { status: 'VERIFIED' })
    toast('Listing removed', 'info')
    reload()
  }

  const getBatch = id => db.getById('batches', id)
  const getOrders = listingId => db.where('orders', o => o.listingId === listingId)

  return (
    <Layout title="My Listings">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize:18, fontWeight:700 }}>Marketplace Listings</h2>
          <p className="text-muted">{listings.filter(l=>l.status==='ACTIVE').length} active · {listings.filter(l=>l.status==='SOLD').length} sold</p>
        </div>
        {verifiedBatches.length > 0 &&
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ Create Listing'}
          </button>
        }
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span className="card-title">🏷 New Listing</span></div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Select Verified Batch *</label>
                  <select className="form-select" value={form.batchId} onChange={e => setForm(f=>({...f,batchId:e.target.value}))} required>
                    <option value="">— Select batch —</option>
                    {verifiedBatches.map(b => (
                      <option key={b.id} value={b.id}>{b.id} · {b.productType} {b.weight}kg Grade {b.grade}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Asking Price (LSL) *</label>
                  <input className="form-input" type="number" min="1" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} placeholder="e.g. 5000" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description for Buyers</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the quality, preparation, packaging..." />
              </div>
              <button className="btn btn-accent btn-full" disabled={submitting}>
                {submitting ? '⏳ Publishing...' : '🛒 Publish to Marketplace'}
              </button>
            </form>
          </div>
        </div>
      )}

      {verifiedBatches.length === 0 && !showForm && listings.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏷</div>
            <div className="empty-title">No listings yet</div>
            <div className="empty-desc">You need verified batches before creating marketplace listings. Register a batch and wait for agent verification.</div>
          </div>
        </div>
      )}

      {/* Listings table */}
      {listings.length > 0 && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Listing ID</th><th>Batch</th><th>Product</th><th>Weight</th><th>Price (LSL)</th><th>Status</th><th>Orders</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {listings.map(l => {
                  const b = getBatch(l.batchId)
                  const orders = getOrders(l.id)
                  return (
                    <tr key={l.id}>
                      <td><span className="font-mono">{l.id}</span></td>
                      <td><span className="font-mono" style={{fontSize:11}}>{l.batchId}</span></td>
                      <td>{b?.productType || '—'}</td>
                      <td>{b?.weight || '—'} kg</td>
                      <td><strong>M{l.price.toLocaleString()}</strong></td>
                      <td><Badge status={l.status} /></td>
                      <td>{orders.length}</td>
                      <td>
                        {l.status === 'ACTIVE' &&
                          <button className="btn btn-danger btn-sm" onClick={() => handleRemove(l)}>Remove</button>
                        }
                        {l.status === 'SOLD' && <span className="text-muted text-sm">Completed</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}
