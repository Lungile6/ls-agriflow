import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { StatCard, Badge } from '../../components/common'
import { useApp } from '../../context/AppContext'

export default function AgentDashboard() {
  const { user, db } = useApp()
  const navigate = useNavigate()
  const [pending, setPending] = useState([])
  const [recent, setRecent] = useState([])

  useEffect(() => {
    const p = db.where('batches', b => b.status === 'PENDING')
    setPending(p)
    const txns = db.where('transactions', t => t.actorId === user.id && (t.type === 'VERIFY' || t.type === 'REJECT'))
      .sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp)).slice(0,8)
    setRecent(txns)
  }, [])

  const totalVerified = db.where('transactions', t => t.actorId === user.id && t.type === 'VERIFY').length
  const totalRejected = db.where('transactions', t => t.actorId === user.id && t.type === 'REJECT').length

  return (
    <Layout title="Agent Dashboard">
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:700 }}>Hello, {user.name.split(' ')[0]} 👋</h2>
        <p className="text-muted">Field Verification Agent · {user.district}</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="⏳" label="Pending Verification" value={pending.length} color="warning" />
        <StatCard icon="✅" label="Total Verified"       value={totalVerified}  color="green"   />
        <StatCard icon="❌" label="Total Rejected"       value={totalRejected}  color="danger"  />
        <StatCard icon="📊" label="Total Reviewed"       value={totalVerified + totalRejected} color="blue" />
      </div>

      {pending.length > 0 && (
        <div className="card" style={{ marginBottom:20, border:'2px solid var(--warning)', background:'var(--warning-light)' }}>
          <div className="card-body" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <strong style={{ color:'var(--warning)' }}>⚠ {pending.length} batch{pending.length>1?'es':''} awaiting verification</strong>
              <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:2 }}>Farmers are waiting for your review</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/agent/verify')}>Go to Queue →</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Verification Activity</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/agent/verify')}>View Queue</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Batch ID</th><th>Action</th><th>Notes / Reason</th></tr></thead>
            <tbody>
              {recent.length === 0 && <tr><td colSpan={4} style={{textAlign:'center',padding:32,color:'var(--text-muted)'}}>No verification activity yet</td></tr>}
              {recent.map(tx => (
                <tr key={tx.id}>
                  <td className="text-sm text-muted">{new Date(tx.timestamp).toLocaleString()}</td>
                  <td><span className="font-mono">{tx.batchId}</span></td>
                  <td><Badge status={tx.type === 'VERIFY' ? 'VERIFIED' : 'REJECTED'} /></td>
                  <td className="text-sm">{tx.data?.notes || tx.data?.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
