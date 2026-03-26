import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Badge, PassportModal, ChainViewer } from '../../components/common'
import { useApp } from '../../context/AppContext'

const STATUSES = ['ALL', 'PENDING', 'VERIFIED', 'REJECTED', 'LISTED', 'SOLD']

export default function MyBatches() {
  const { user, db } = useApp()
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [passport, setPassport] = useState(null)
  const [chainBatch, setChainBatch] = useState(null)

  useEffect(() => {
    setBatches(db.where('batches', b => b.farmerId === user.id))
  }, [user.id])

  const filtered = batches.filter(b => {
    if (filter !== 'ALL' && b.status !== filter) return false
    if (search && !b.id.toLowerCase().includes(search.toLowerCase()) &&
        !b.productType.toLowerCase().includes(search.toLowerCase()) &&
        !b.region.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const chainTxns = chainBatch ? db.where('transactions', t => t.batchId === chainBatch.id) : []

  return (
    <Layout title="My Batches">
      <div className="toolbar">
        <input className="form-input search-input" placeholder="🔍 Search by ID, product, region…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-tabs">
          {STATUSES.map(s => (
            <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'ALL' ? `All (${batches.length})` : `${s} (${batches.filter(b=>b.status===s).length})`}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/farmer/register')}>+ Register New</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Batch ID</th><th>Product</th><th>Weight</th><th>Grade</th><th>Region</th>
                <th>Harvest Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <div className="empty-title">No batches found</div>
                    <div className="empty-desc">{filter !== 'ALL' ? 'Try a different filter' : 'Register your first batch to get started'}</div>
                    {filter === 'ALL' && <button className="btn btn-primary btn-sm" onClick={() => navigate('/farmer/register')}>+ Register Batch</button>}
                  </div>
                </td></tr>
              )}
              {filtered.map(b => (
                <tr key={b.id}>
                  <td><span className="font-mono">{b.id}</span></td>
                  <td>{b.productType === 'Wool' ? '🐑' : '🐐'} {b.productType}</td>
                  <td>{b.weight} kg</td>
                  <td><strong>{b.grade}</strong></td>
                  <td>{b.region}</td>
                  <td>{b.harvestDate}</td>
                  <td><Badge status={b.status} /></td>
                  <td>
                    <div style={{ display:'flex', gap:5 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setPassport(b)}>🛂</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setChainBatch(b)}>⛓</button>
                      {b.status === 'VERIFIED' && !db.where('listings',l=>l.batchId===b.id).length &&
                        <button className="btn btn-accent btn-sm" onClick={() => navigate('/farmer/listings', { state: { batchId: b.id } })}>🏷 List</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chain modal */}
      {chainBatch && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 className="card-title">⛓ Chain of Custody — {chainBatch.id}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setChainBatch(null)}>✕</button>
            </div>
            <div className="modal-body">
              <ChainViewer transactions={chainTxns} />
            </div>
          </div>
        </div>
      )}

      {passport && (
        <PassportModal batch={passport} farmer={user} onClose={() => setPassport(null)} />
      )}
    </Layout>
  )
}
