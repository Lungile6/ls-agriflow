import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ChainViewer, Badge } from '../../components/common'
import { useApp } from '../../context/AppContext'
import { verifyChain } from '../../utils/crypto'

export default function VerifyBatch() {
  const { db, user } = useApp()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('batch') || '')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (params.get('batch')) handleSearch(params.get('batch'))
  }, [])

  async function handleSearch(q) {
    const id = (q || query).trim()
    if (!id) return
    setError('')
    setResult(null)
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))

    const batch = db.getById('batches', id) ||
      db.where('batches', b => b.hash?.startsWith(id.toLowerCase()))[0]

    if (!batch) {
      setError('Batch not found. Please check the ID or hash.')
      setLoading(false)
      return
    }

    const txns = db.where('transactions', t => t.batchId === batch.id)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    const farmer = db.getById('users', batch.farmerId)
    const chainValid = verifyChain(txns)
    setResult({ batch, txns, farmer, chainValid })
    setLoading(false)
  }

  const content = (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">🔍 Verify Batch Provenance</span>
        </div>
        <div className="card-body">
          <p className="text-muted" style={{ marginBottom: 14, fontSize: 13 }}>
            Enter a Batch ID or SHA-256 hash to verify its authenticity and view the full chain of custody.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="form-input"
              style={{ flex: 1 }}
              placeholder="e.g. BATCH-KX7A-F001 or sha256 hash..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary" onClick={() => handleSearch()} disabled={loading}>
              {loading ? '⏳' : '🔍 Verify'}
            </button>
          </div>
          {error && <p className="form-error" style={{ marginTop: 10 }}>⚠ {error}</p>}
        </div>
      </div>

      {result && (
        <div>
          {/* Verification status */}
          <div className="card" style={{
            marginBottom: 16,
            border: `2px solid ${result.chainValid ? 'var(--success)' : 'var(--danger)'}`,
            background: result.chainValid ? 'var(--success-light)' : 'var(--danger-light)'
          }}>
            <div className="card-body" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: result.chainValid ? 'var(--success)' : 'var(--danger)', marginBottom: 4 }}>
                {result.chainValid ? '✅ BLOCKCHAIN VERIFIED — Chain is intact' : '❌ CHAIN INTEGRITY FAILURE — Data may be tampered'}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {result.chainValid
                  ? 'All transaction hashes in this batch\'s chain are valid and correctly linked.'
                  : 'One or more hashes in the chain do not match. This batch may have been tampered with.'}
              </p>
            </div>
          </div>

          {/* Batch details */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">📦 Batch Details</span>
              <Badge status={result.batch.status} />
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['Batch ID', result.batch.id],
                  ['Product', result.batch.productType],
                  ['Weight', `${result.batch.weight} kg`],
                  ['Grade', result.batch.grade],
                  ['Origin Region', result.batch.region],
                  ['Harvest Date', result.batch.harvestDate],
                  ['Registered Farmer', result.farmer?.name || '—'],
                  ['District', result.farmer?.district || '—'],
                  ['Association', result.farmer?.association || '—'],
                  ['Registration Date', new Date(result.batch.createdAt).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--bg)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                    <div className="text-muted" style={{ fontSize: 11 }}>{k}</div>
                    <div style={{ fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: 10, background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>SHA-256 Proof of Origin Hash</div>
                <div className="font-mono" style={{ wordBreak: 'break-all', fontSize: 11 }}>{result.batch.hash}</div>
              </div>
            </div>
          </div>

          {/* Chain */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⛓ Full Chain of Custody ({result.txns.length} events)</span>
            </div>
            <div className="card-body">
              <ChainViewer transactions={result.txns} showHash />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (!user) {
    return (
      <div className="app-shell" style={{ '--sidebar': '0px' }}>
        <main className="main-content" style={{ marginLeft: 0 }}>
          <div className="topbar">
            <span className="topbar-title">LS-AgriFlow — Batch Verification</span>
          </div>
          <div className="page-content">{content}</div>
        </main>
      </div>
    )
  }
  return <Layout title="Verify Batch">{content}</Layout>
}
