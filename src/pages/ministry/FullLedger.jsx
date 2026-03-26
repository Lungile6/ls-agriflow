import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { useApp } from '../../context/AppContext'
import { verifyChain } from '../../utils/crypto'

const TX_LABELS = { REGISTER:'Registered', VERIFY:'Verified', REJECT:'Rejected', LIST:'Listed', PURCHASE:'Purchased', CERTIFY:'Certified' }
const TX_COLORS = { REGISTER:'var(--primary)', VERIFY:'var(--success)', REJECT:'var(--danger)', LIST:'var(--warning)', PURCHASE:'var(--purple)', CERTIFY:'var(--accent)' }

export default function FullLedger() {
  const { db, userName } = useApp()
  const [txns, setTxns]     = useState([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [chainOk, setChainOk] = useState(null)
  const [page, setPage]     = useState(1)
  const PAGE_SIZE = 25

  useEffect(() => {
    const all = db.getAll('transactions').sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp))
    setTxns(all)
    setChainOk(verifyChain([...all].reverse()))
  }, [])

  const types = ['ALL','REGISTER','VERIFY','REJECT','LIST','PURCHASE','CERTIFY']

  const filtered = txns.filter(t => {
    if (filter !== 'ALL' && t.type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return t.id.toLowerCase().includes(q) ||
             t.batchId.toLowerCase().includes(q) ||
             t.actorId.toLowerCase().includes(q) ||
             t.hash?.toLowerCase().includes(q)
    }
    return true
  })

  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  return (
    <Layout title="Full Ledger">
      {/* Chain integrity banner */}
      {chainOk !== null && (
        <div style={{
          marginBottom: 16, padding: '12px 18px',
          background: chainOk ? 'var(--success-light)' : 'var(--danger-light)',
          border: `1px solid ${chainOk ? 'var(--success)' : 'var(--danger)'}`,
          borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span style={{ fontSize: 18 }}>{chainOk ? '✅' : '❌'}</span>
          <div>
            <strong style={{ color: chainOk ? 'var(--success)' : 'var(--danger)' }}>
              {chainOk ? 'Chain Integrity: VALID' : 'Chain Integrity: COMPROMISED'}
            </strong>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
              {chainOk
                ? `All ${txns.length} transactions verified — hashes are intact and correctly linked`
                : 'One or more transaction hashes do not match — chain integrity violated'}
            </p>
          </div>
        </div>
      )}

      <div className="toolbar">
        <input
          className="form-input search-input"
          placeholder="🔍 Search by TX ID, Batch ID, hash..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <div className="filter-tabs">
          {types.map(t => (
            <button
              key={t}
              className={`filter-tab ${filter===t?'active':''}`}
              onClick={() => { setFilter(t); setPage(1) }}
            >
              {t === 'ALL' ? `All (${txns.length})` : `${TX_LABELS[t]} (${txns.filter(x=>x.type===t).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">⛓ Immutable Ledger</span>
          <span className="text-muted text-sm">{filtered.length} transactions · Page {page}/{totalPages||1}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Batch</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Timestamp</th>
                <th>Hash (partial)</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>No transactions found</td></tr>
              )}
              {paginated.map((tx, idx) => (
                <tr key={tx.id}>
                  <td className="text-muted text-sm">{(page-1)*PAGE_SIZE + idx + 1}</td>
                  <td><span className="font-mono">{tx.id}</span></td>
                  <td>
                    <span style={{
                      background: `${TX_COLORS[tx.type]}22`,
                      color: TX_COLORS[tx.type],
                      padding: '2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 600
                    }}>
                      {TX_LABELS[tx.type] || tx.type}
                    </span>
                  </td>
                  <td><span className="font-mono">{tx.batchId}</span></td>
                  <td>{userName(tx.actorId)}</td>
                  <td style={{ textTransform:'capitalize' }}>{tx.actorRole}</td>
                  <td className="text-sm text-muted">{new Date(tx.timestamp).toLocaleString()}</td>
                  <td>
                    <span className="font-mono" style={{ fontSize: 10 }}>{tx.hash?.slice(0,20)}...</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="card-footer" style={{ display:'flex', gap:8, justifyContent:'center' }}>
            <button className="btn btn-secondary btn-sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Prev</button>
            {Array.from({length: totalPages}, (_,i) => (
              <button key={i} className={`btn btn-sm ${page===i+1?'btn-primary':'btn-secondary'}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="btn btn-secondary btn-sm" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next →</button>
          </div>
        )}
      </div>
    </Layout>
  )
}
