import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { Badge, ChainViewer, PassportModal, ProductThumb } from '../../components/common'
import { useApp } from '../../context/AppContext'
import { generateId, createTransaction } from '../../utils/crypto'

export default function ProductDetail() {
  const { id } = useParams()
  const { user, db, toast } = useApp()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [batch, setBatch] = useState(null)
  const [farmer, setFarmer] = useState(null)
  const [txns, setTxns] = useState([])
  const [passport, setPassport] = useState(null)
  const [purchasing, setPurchasing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const l = db.getById('listings', id)
    if (!l) { navigate('/marketplace'); return }
    setListing(l)
    const b = db.getById('batches', l.batchId)
    setBatch(b)
    setFarmer(db.getById('users', l.farmerId))
    setTxns(db.where('transactions', t => t.batchId === l.batchId))
  }, [id])

  async function handlePurchase() {
    if (!user) { navigate('/'); return }
    if (user.role !== 'buyer') { toast('Only registered buyers can purchase', 'error'); return }
    setPurchasing(true)
    await new Promise(r => setTimeout(r, 700))

    const order = {
      id: generateId('ORD'),
      listingId: listing.id,
      batchId: batch.id,
      buyerId: user.id,
      sellerId: listing.farmerId,
      price: listing.price,
      currency: 'LSL',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    }
    db.insert('orders', order)
    db.update('listings', listing.id, { status: 'SOLD', buyerId: user.id })
    db.update('batches', batch.id, { status: 'SOLD' })

    const txPurchase = createTransaction('PURCHASE', batch.id, user.id, user.role, { orderId: order.id, price: listing.price })
    db.insert('transactions', txPurchase)

    // auto-generate certificate
    const cert = {
      id: generateId('CERT'),
      batchId: batch.id,
      orderId: order.id,
      buyerId: user.id,
      farmerId: listing.farmerId,
      proofHash: txPurchase.hash,
      issuedAt: new Date().toISOString(),
      issuedBy: 'LSAgriFlow_Supply_v1',
    }
    db.insert('certificates', cert)

    const txCert = createTransaction('CERTIFY', batch.id, user.id, user.role, { certId: cert.id, orderId: order.id })
    db.insert('transactions', txCert)

    setPurchasing(false)
    setShowConfirm(false)
    toast(`Purchase complete! Certificate ${cert.id} issued.`, 'success')
    navigate('/buyer/orders')
  }

  if (!listing || !batch) return <Layout title="Product"><div className="loading"><div className="spinner"/></div></Layout>

  const isOwner = user?.id === listing.farmerId
  const alreadyBought = user ? db.where('orders', o => o.listingId === listing.id && o.buyerId === user.id).length > 0 : false
  const canBuy = user?.role === 'buyer' && listing.status === 'ACTIVE' && !alreadyBought && !isOwner

  const wrap = c => user
    ? <Layout title="Product Detail">{c}</Layout>
    : <div className="app-shell" style={{'--sidebar':'0px'}}><main className="main-content" style={{marginLeft:0}}><div className="topbar"><span className="topbar-title">LS-AgriFlow</span><button className="btn btn-primary btn-sm" onClick={()=>navigate('/')}>Sign In to Buy</button></div><div className="page-content">{c}</div></main></div>

  return wrap(
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:16 }} onClick={() => navigate('/marketplace')}>← Back to Marketplace</button>
      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* Left column */}
        <div>
          <div className="card" style={{ marginBottom:16 }}>
            <ProductThumb productType={batch.productType} />
            <div className="card-body">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div>
                  <h1 style={{ fontSize:20, fontWeight:700 }}>{batch.productType} — {batch.weight} kg</h1>
                  <p className="text-muted">Grade <strong>{batch.grade}</strong> · {batch.region}</p>
                </div>
                <Badge status={listing.status === 'ACTIVE' ? 'VERIFIED' : listing.status} />
              </div>
              {listing.description && <p style={{ fontSize:14, marginBottom:14, color:'var(--text-secondary)' }}>"{listing.description}"</p>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13 }}>
                {[
                  ['Product', batch.productType],
                  ['Weight', `${batch.weight} kg`],
                  ['Grade', batch.grade],
                  ['Region', batch.region],
                  ['Harvest Date', batch.harvestDate],
                  ['Farmer', farmer?.name],
                  ['District', farmer?.district],
                  ['Association', farmer?.association],
                ].map(([k,v]) => (
                  <div key={k} style={{ background:'var(--bg)', padding:'8px 10px', borderRadius:'var(--radius-sm)' }}>
                    <div className="text-muted" style={{ fontSize:11, marginBottom:2 }}>{k}</div>
                    <div style={{ fontWeight:500 }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer" style={{ display:'flex', gap:10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setPassport(batch)}>🛂 View Digital Passport</button>
            </div>
          </div>

          {/* Price + Buy */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:28, fontWeight:800, color:'var(--primary)' }}>M{listing.price.toLocaleString()}</div>
                <div className="text-muted text-sm">LSL · ~USD {(listing.price * 0.054).toFixed(0)}</div>
              </div>
              {listing.status === 'SOLD' && <Badge status="SOLD" />}
            </div>
            {canBuy && !showConfirm && (
              <button className="btn btn-accent btn-full btn-lg" onClick={() => setShowConfirm(true)}>🛒 Purchase This Batch</button>
            )}
            {showConfirm && (
              <div style={{ background:'var(--warning-light)', borderRadius:'var(--radius-sm)', padding:16, border:'1px solid var(--warning)' }}>
                <p style={{ fontWeight:600, marginBottom:8 }}>Confirm Purchase</p>
                <p style={{ fontSize:13, marginBottom:14, color:'var(--text-secondary)' }}>
                  You are purchasing <strong>{batch.productType} {batch.weight}kg</strong> from <strong>{farmer?.name}</strong> for <strong>M{listing.price.toLocaleString()} LSL</strong>. An export certificate will be issued automatically.
                </p>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button className="btn btn-accent btn-sm" disabled={purchasing} onClick={handlePurchase} style={{ flex:1, justifyContent:'center' }}>
                    {purchasing ? '⏳ Processing on ledger...' : '✓ Confirm Purchase'}
                  </button>
                </div>
              </div>
            )}
            {listing.status === 'SOLD' && <p className="text-muted text-sm" style={{textAlign:'center', marginTop:8}}>This batch has been sold</p>}
            {!user && <button className="btn btn-primary btn-full" onClick={() => navigate('/')}>Sign in to Purchase</button>}
          </div>
        </div>

        {/* Right column — Chain of Custody */}
        <div className="card">
          <div className="card-header"><span className="card-title">⛓ Chain of Custody</span></div>
          <div className="card-body">
            <div style={{ background:'var(--success-light)', borderRadius:'var(--radius-sm)', padding:10, marginBottom:16, fontSize:13 }}>
              <strong style={{ color:'var(--success)' }}>✓ Blockchain Verified</strong>
              <p style={{ color:'var(--text-secondary)', marginTop:2 }}>All transactions are immutably recorded. SHA-256 hashed and chain-linked.</p>
            </div>
            <ChainViewer transactions={txns} />
          </div>
          <div className="card-footer">
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>
              Batch Hash: <span className="font-mono">{batch.hash?.slice(0,40)}...</span>
            </div>
          </div>
        </div>
      </div>

      {passport && <PassportModal batch={batch} farmer={farmer} onClose={() => setPassport(null)} />}
    </div>
  )
}
