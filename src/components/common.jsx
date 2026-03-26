import React, { useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

// ── StatCard ──────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, change, color = 'blue', sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {change && <div className={`stat-change ${change.startsWith('+') ? 'up' : 'down'}`}>{change}</div>}
        {sub && <div className="text-muted text-sm" style={{marginTop:2}}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────
const STATUS_ICONS = {
  PENDING: '⏳', VERIFIED: '✓', REJECTED: '✕', LISTED: '🏷', SOLD: '💰', CERTIFIED: '📜',
  ACTIVE: '●', INACTIVE: '○', COMPLETED: '✓',
}
export function Badge({ status }) {
  const cls = `badge badge-${status.toLowerCase()}`
  return <span className={cls}>{STATUS_ICONS[status] || ''} {status}</span>
}

// ── Chain Viewer ───────────────────────────────────────────────────────────
const TX_META = {
  REGISTER: { icon: '📋', label: 'Batch Registered',     color: '#2E75B6' },
  VERIFY:   { icon: '✅', label: 'Batch Verified',        color: '#059669' },
  REJECT:   { icon: '❌', label: 'Batch Rejected',        color: '#DC2626' },
  LIST:     { icon: '🏷', label: 'Listed on Marketplace', color: '#D97706' },
  PURCHASE: { icon: '💰', label: 'Purchased',             color: '#7C3AED' },
  CERTIFY:  { icon: '📜', label: 'Certificate Issued',    color: '#0D9B76' },
}
export function ChainViewer({ transactions, showHash = true }) {
  if (!transactions?.length) return <p className="text-muted text-sm">No transactions yet.</p>
  return (
    <div className="chain">
      {transactions.map((tx, i) => {
        const meta = TX_META[tx.type] || { icon: '◆', label: tx.type, color: '#94A3B8' }
        return (
          <div key={tx.id} className="chain-item">
            <div className="chain-left">
              <div className={`chain-dot ${tx.type}`}>{meta.icon}</div>
              {i < transactions.length - 1 && <div className="chain-line" />}
            </div>
            <div className="chain-body">
              <div className="chain-event" style={{ color: meta.color }}>{meta.label}</div>
              <div className="chain-time">{new Date(tx.timestamp).toLocaleString()} · by {tx.actorRole}</div>
              {tx.data?.notes && <div className="text-sm text-muted mt-1">Note: {tx.data.notes}</div>}
              {tx.data?.reason && <div className="text-sm" style={{color:'var(--danger)'}}>Reason: {tx.data.reason}</div>}
              {tx.data?.grade && <div className="text-sm text-muted">Grade assigned: {tx.data.grade}</div>}
              {tx.data?.price && <div className="text-sm text-muted">Price: LSL {tx.data.price.toLocaleString()}</div>}
              {showHash && <div className="chain-hash">#{tx.hash}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Digital Passport Modal ─────────────────────────────────────────────────
export function PassportModal({ batch, farmer, onClose }) {
  const ref = useRef()
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const verifyUrl = `${window.location.origin}/verify?batch=${batch.id}&hash=${batch.hash}`

  function handlePrint() {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Digital Passport — ${batch.id}</title>
      <style>body{font-family:Arial;padding:30px;max-width:400px;margin:0 auto;}
      .header{color:#1F4E79;font-size:11px;font-weight:700;letter-spacing:2px;text-align:center;margin-bottom:16px;}
      .qr{display:flex;justify-content:center;margin:16px 0;}
      table{width:100%;border-collapse:collapse;font-size:12px;}
      td{padding:6px 8px;border:1px solid #e2e8f0;}td:first-child{font-weight:600;color:#1F4E79;width:40%;}
      .hash{font-family:monospace;font-size:9px;word-break:break-all;color:#94A3B8;margin-top:14px;padding:8px;background:#f8faff;border-radius:6px;}
      </style></head><body>
      <div class="header">LS-AGRIFLOW · LESOTHO · DIGITAL PASSPORT</div>
      <div class="qr"><svg>${document.querySelector('#passport-qr svg')?.innerHTML || ''}</svg></div>
      <table>
        <tr><td>Batch ID</td><td>${batch.id}</td></tr>
        <tr><td>Product</td><td>${batch.productType}</td></tr>
        <tr><td>Weight</td><td>${batch.weight} kg</td></tr>
        <tr><td>Grade</td><td>${batch.grade}</td></tr>
        <tr><td>Region</td><td>${batch.region}</td></tr>
        <tr><td>Harvest</td><td>${batch.harvestDate}</td></tr>
        <tr><td>Farmer</td><td>${farmer?.name || batch.farmerId}</td></tr>
        <tr><td>Status</td><td>${batch.status}</td></tr>
      </table>
      <div class="hash">SHA-256: ${batch.hash}</div>
      </body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div className="modal-overlay">
      <div className="modal" ref={ref} style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h3 className="card-title">🛂 Digital Passport</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="passport-card">
            <div className="passport-header">LS-AGRIFLOW · LESOTHO · DIGITAL PASSPORT</div>
            <div id="passport-qr">
              <QRCodeSVG value={verifyUrl} size={160} level="H" includeMargin />
            </div>
            <div style={{marginTop:16, fontSize:13, textAlign:'left'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                {[
                  ['Batch ID', batch.id],
                  ['Product', batch.productType],
                  ['Weight', `${batch.weight} kg`],
                  ['Grade', batch.grade],
                  ['Region', batch.region],
                  ['Harvest Date', batch.harvestDate],
                  ['Farmer', farmer?.name || batch.farmerId],
                  ['Status', batch.status],
                ].map(([k,v]) => (
                  <tr key={k}>
                    <td style={{padding:'5px 6px', fontWeight:600, color:'var(--primary)', width:'40%', borderBottom:'1px solid var(--border)'}}>{k}</td>
                    <td style={{padding:'5px 6px', borderBottom:'1px solid var(--border)'}}>{v}</td>
                  </tr>
                ))}
              </table>
            </div>
            <div className="passport-hash">SHA-256 Proof of Origin: {batch.hash}</div>
            <div style={{marginTop:8, fontSize:9, color:'var(--text-muted)', fontFamily:'monospace', textAlign:'center'}}>
              Contract: LSAgriFlow_Supply_v1 · ls-agriflow.gov.ls
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨 Print / Save PDF</button>
        </div>
      </div>
    </div>
  )
}

// ── Confirm Modal ──────────────────────────────────────────────────────────
export function ConfirmModal({ title, message, onConfirm, onCancel, danger }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 360 }}>
        <div className="modal-header">
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'} btn-sm`} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

// ── Product thumb background ───────────────────────────────────────────────
const PRODUCT_COLORS = {
  'Wool':   { bg: '#E6F1FB', emoji: '🐑' },
  'Mohair': { bg: '#E0F5EE', emoji: '🐐' },
}
export function ProductThumb({ productType }) {
  const info = PRODUCT_COLORS[productType] || { bg: '#F1F5F9', emoji: '📦' }
  return (
    <div className="product-thumb" style={{ background: info.bg }}>
      {info.emoji}
    </div>
  )
}
