import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { CONTRACT_NAME, TAGLINE, VERIFY_DOMAIN } from '../../components/Logo'
import { useApp } from '../../context/AppContext'

export default function Reports() {
  const { db } = useApp()
  const [certs, setCerts]     = useState([])
  const [batches, setBatches] = useState([])
  const [farmers, setFarmers] = useState([])

  useEffect(() => {
    setCerts(db.getAll('certificates').sort((a,b) => new Date(b.issuedAt)-new Date(a.issuedAt)))
    setBatches(db.getAll('batches'))
    setFarmers(db.where('users', u => u.role === 'farmer'))
  }, [])

  function printNationalReport() {
    const total    = batches.length
    const verified = batches.filter(b => ['VERIFIED','LISTED','SOLD'].includes(b.status)).length
    const sold     = batches.filter(b => b.status === 'SOLD').length
    const rejected = batches.filter(b => b.status === 'REJECTED').length
    const weight   = batches.reduce((s,b) => s+b.weight, 0)
    const wool     = batches.filter(b => b.productType==='Wool').length
    const mohair   = batches.filter(b => b.productType==='Mohair').length
    const orders   = db.getAll('orders')
    const revenue  = orders.reduce((s,o) => s+o.price, 0)

    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>LS-AgriFlow National Report</title>
      <style>
        body{font-family:Arial;padding:40px;max-width:700px;margin:0 auto;}
        .header{text-align:center;border-bottom:3px solid #1F4E79;padding-bottom:20px;margin-bottom:30px;}
        .logo{font-size:26px;font-weight:800;color:#1F4E79;}
        h2{color:#1F4E79;margin-top:28px;}
        table{width:100%;border-collapse:collapse;margin-bottom:20px;}
        th{background:#1F4E79;color:#fff;padding:10px;text-align:left;font-size:13px;}
        td{padding:9px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;}
        tr:nth-child(even)td{background:#f8faff;}
        .kpi-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:24px;}
        .kpi{background:#f8faff;border:1px solid #e2e8f0;border-radius:8px;padding:14px;}
        .kpi-val{font-size:26px;font-weight:800;color:#1F4E79;}
        .kpi-lbl{font-size:12px;color:#666;margin-top:3px;}
        .footer{text-align:center;color:#999;font-size:11px;margin-top:40px;border-top:1px solid #eee;padding-top:16px;}
      </style></head><body>
      <div class="header">
        <div class="logo">LS-AgriFlow</div>
        <p style="color:#666;margin-top:4px">Ministry of Agriculture · National Supply Chain Report</p>
        <p style="color:#999;font-size:12px">Generated: ${new Date().toLocaleString()}</p>
      </div>
      <h2>Key Performance Indicators</h2>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val">${total}</div><div class="kpi-lbl">Total Batches Registered</div></div>
        <div class="kpi"><div class="kpi-val">${verified}</div><div class="kpi-lbl">Verified Batches</div></div>
        <div class="kpi"><div class="kpi-val">${sold}</div><div class="kpi-lbl">Batches Sold</div></div>
        <div class="kpi"><div class="kpi-val">${rejected}</div><div class="kpi-lbl">Batches Rejected</div></div>
        <div class="kpi"><div class="kpi-val">${weight.toLocaleString()} kg</div><div class="kpi-lbl">Total Weight Tracked</div></div>
        <div class="kpi"><div class="kpi-val">M${revenue.toLocaleString()}</div><div class="kpi-lbl">Total Trade Volume (LSL)</div></div>
        <div class="kpi"><div class="kpi-val">${farmers.length}</div><div class="kpi-lbl">Registered Farmers</div></div>
        <div class="kpi"><div class="kpi-val">${certs.length}</div><div class="kpi-lbl">Certificates Issued</div></div>
        <div class="kpi"><div class="kpi-val">${wool} / ${mohair}</div><div class="kpi-lbl">Wool / Mohair Batches</div></div>
      </div>
      <h2>Registered Farmers</h2>
      <table>
        <tr><th>Name</th><th>District</th><th>Association</th><th>Batches</th><th>Verified</th></tr>
        ${farmers.map(f => {
          const fb = batches.filter(b => b.farmerId===f.id)
          const fv = fb.filter(b => ['VERIFIED','LISTED','SOLD'].includes(b.status)).length
          return `<tr><td>${f.name}</td><td>${f.district||'—'}</td><td>${f.association||'—'}</td><td>${fb.length}</td><td>${fv}</td></tr>`
        }).join('')}
      </table>
      <h2>Export Certificates</h2>
      <table>
        <tr><th>Certificate ID</th><th>Batch ID</th><th>Issue Date</th><th>Proof Hash (partial)</th></tr>
        ${certs.map(c => `<tr><td>${c.id}</td><td>${c.batchId}</td><td>${new Date(c.issuedAt).toLocaleDateString()}</td><td style="font-family:monospace;font-size:11px">${c.proofHash?.slice(0,32)}...</td></tr>`).join('')}
      </table>
      <div class="footer">LS-AgriFlow · LSAgriFlow_Supply_v1 · Ho tloha polasing ho ea 'marakeng<br/>Lesotho Ministry of Agriculture · Confidential Government Report · ${new Date().getFullYear()}</div>
      </body></html>`)
    win.document.close()
    win.print()
  }

  const getBatch   = id => db.getById('batches', id)
  const getFarmer  = id => db.getById('users', id)
  const getBuyer   = id => db.getById('users', id)

  // Farmer performance summary
  const farmerSummary = farmers.map(f => {
    const fb = batches.filter(b => b.farmerId === f.id)
    const fv = fb.filter(b => ['VERIFIED','LISTED','SOLD'].includes(b.status)).length
    const fs = fb.filter(b => b.status === 'SOLD').length
    const fw = fb.reduce((s,b) => s+b.weight, 0)
    const income = db.where('orders', o => o.sellerId === f.id).reduce((s,o) => s+o.price, 0)
    return { ...f, total: fb.length, verified: fv, sold: fs, weight: fw, income }
  })

  return (
    <Layout title="Reports & Certificates">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Reports &amp; Certificates</h2>
          <p className="text-muted">{certs.length} certificates issued</p>
        </div>
        <button className="btn btn-primary" onClick={printNationalReport}>📥 Export National Report (PDF)</button>
      </div>

      {/* Farmer performance */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span className="card-title">👨‍🌾 Farmer Performance Summary</span></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Farmer</th><th>District</th><th>Association</th>
                <th>Batches</th><th>Verified</th><th>Sold</th>
                <th>Total Weight</th><th>Income (LSL)</th>
              </tr>
            </thead>
            <tbody>
              {farmerSummary.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.name}</strong></td>
                  <td>{f.district}</td>
                  <td>{f.association}</td>
                  <td>{f.total}</td>
                  <td style={{ color: 'var(--success)' }}>{f.verified}</td>
                  <td style={{ color: 'var(--purple)' }}>{f.sold}</td>
                  <td>{f.weight} kg</td>
                  <td><strong>M{f.income.toLocaleString()}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificates */}
      <div className="card">
        <div className="card-header"><span className="card-title">📜 Export Certificates</span></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Certificate ID</th><th>Batch</th><th>Product</th>
                <th>Weight</th><th>Farmer</th><th>Buyer</th>
                <th>Issued</th><th>Proof Hash</th>
              </tr>
            </thead>
            <tbody>
              {certs.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>No certificates yet</td></tr>
              )}
              {certs.map(c => {
                const b = getBatch(c.batchId)
                const f = getFarmer(c.farmerId)
                const buyer = getBuyer(c.buyerId)
                return (
                  <tr key={c.id}>
                    <td><span className="font-mono">{c.id}</span></td>
                    <td><span className="font-mono" style={{fontSize:11}}>{c.batchId}</span></td>
                    <td>{b?.productType}</td>
                    <td>{b?.weight} kg</td>
                    <td>{f?.name}</td>
                    <td>{buyer?.company || buyer?.name}</td>
                    <td className="text-sm">{new Date(c.issuedAt).toLocaleDateString()}</td>
                    <td><span className="font-mono" style={{fontSize:10}}>{c.proofHash?.slice(0,20)}...</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
