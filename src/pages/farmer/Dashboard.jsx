import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { StatCard, Badge, PassportModal } from '../../components/common'
import { useApp } from '../../context/AppContext'

export default function FarmerDashboard() {
  const { user, db } = useApp()
  const navigate = useNavigate()
  const [batches, setBatches] = useState([])
  const [listings, setListings] = useState([])
  const [passport, setPassport] = useState(null)

  useEffect(() => {
    setBatches(db.where('batches', b => b.farmerId === user.id))
    setListings(db.where('listings', l => l.farmerId === user.id && l.status === 'ACTIVE'))
  }, [user.id])

  const counts = batches.reduce((a, b) => { a[b.status] = (a[b.status]||0)+1; return a }, {})
  const income = db.where('orders', o => o.sellerId === user.id && o.status === 'COMPLETED')
                   .reduce((s, o) => s + o.price, 0)

  const recent = [...batches].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)

  return (
    <Layout title="Farmer Dashboard">
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Good day, {user.name.split(' ')[0]} 👋</h2>
        <p className="text-muted">District: {user.district} · Association: {user.association}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="📦" label="Total Batches"    value={batches.length}           color="blue" />
        <StatCard icon="✅" label="Verified"          value={counts.VERIFIED||0}        color="green" />
        <StatCard icon="⏳" label="Pending Review"    value={counts.PENDING||0}         color="warning" />
        <StatCard icon="🏷" label="Active Listings"   value={listings.length}           color="purple" />
        <StatCard icon="💰" label="Total Income (LSL)" value={`M${income.toLocaleString()}`} color="green" />
      </div>

      {/* Recent Batches */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Batches</span>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/farmer/batches')}>View All</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/farmer/register')}>+ Register New</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Batch ID</th><th>Product</th><th>Weight</th><th>Grade</th><th>Harvest</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>No batches yet. Register your first batch!</td></tr>
              )}
              {recent.map(b => (
                <tr key={b.id}>
                  <td><span className="font-mono">{b.id}</span></td>
                  <td>{b.productType}</td>
                  <td>{b.weight} kg</td>
                  <td><strong>{b.grade}</strong></td>
                  <td>{b.harvestDate}</td>
                  <td><Badge status={b.status} /></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setPassport(b)}>🛂 Passport</button>
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

      {passport && (
        <PassportModal
          batch={passport}
          farmer={user}
          onClose={() => setPassport(null)}
        />
      )}
    </Layout>
  )
}
