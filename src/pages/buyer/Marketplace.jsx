import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ProductThumb, Badge } from '../../components/common'
import { MokorotloMark, TAGLINE, CONTRACT_NAME } from '../../components/Logo'
import { useApp } from '../../context/AppContext'

const PRODUCT_TYPES = ['All', 'Wool', 'Mohair']
const GRADES = ['All', 'A+', 'A', 'B', 'C']
const REGIONS = ['All', 'Quthing', 'Maseru', 'Leribe', 'Berea', 'Mafeteng', "Mohale's Hoek", 'Mokhotlong', 'Thaba-Tseka']

export default function Marketplace() {
  const { db, user } = useApp()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [gradeFilter, setGradeFilter] = useState('All')
  const [regionFilter, setRegionFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const active = db.where('listings', l => l.status === 'ACTIVE')
    setListings(active)
  }, [])

  const enriched = listings.map(l => ({
    ...l,
    batch: db.getById('batches', l.batchId),
    farmer: db.getById('users', l.farmerId),
  })).filter(l => l.batch)

  const filtered = enriched.filter(l => {
    if (typeFilter !== 'All' && l.batch.productType !== typeFilter) return false
    if (gradeFilter !== 'All' && l.batch.grade !== gradeFilter) return false
    if (regionFilter !== 'All' && l.batch.region !== regionFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return l.batch.productType.toLowerCase().includes(q) ||
             l.batch.region.toLowerCase().includes(q) ||
             l.farmer?.name.toLowerCase().includes(q) ||
             l.description?.toLowerCase().includes(q)
    }
    return true
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'price_asc') return a.price - b.price
    if (sortBy === 'price_desc') return b.price - a.price
    if (sortBy === 'weight') return b.batch.weight - a.batch.weight
    return 0
  })

  const wrapWithLayout = (content) => {
    if (!user) {
      // public view
      return (
        <div className="app-shell" style={{ '--sidebar': '0px' }}>
          <main className="main-content" style={{ marginLeft:0 }}>
            <div className="topbar">
              <span className="topbar-title">LS-AgriFlow Marketplace</span>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>Sign In</button>
            </div>
            <div className="page-content">{content}</div>
          </main>
        </div>
      )
    }
    return <Layout title="Marketplace">{content}</Layout>
  }

  return wrapWithLayout(
    <>
      {/* Hero banner */}
      <div style={{ background:'linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 100%)', borderRadius:'var(--radius)', padding:'28px 28px 24px', marginBottom:24, color:'#fff' }}>
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:6}}>
          <MokorotloMark size={42} color="#FFFFFF" />
          <div>
            <h1 style={{ fontSize:22, fontWeight:900, marginBottom:2, letterSpacing:'-0.5px' }}>LS-AgriFlow — Marketplace</h1>
            <p style={{ opacity:0.75, fontSize:12.5, fontStyle:'italic' }}>{TAGLINE}</p>
          </div>
        </div>
        <p style={{ opacity:0.85, fontSize:14, marginTop:4 }}>Blockchain-verified wool &amp; mohair — direct from Lesotho farmers. Every batch carries a cryptographic proof of origin.</p>
        <div style={{ display:'flex', gap:16, marginTop:14, fontSize:13 }}>
          <span>✓ {db.where('batches',b=>b.status==='VERIFIED').length} verified batches</span>
          <span>✓ {db.where('users',u=>u.role==='farmer').length} registered farmers</span>
          <span>✓ Immutable provenance</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:20, padding:'14px 18px' }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <input className="form-input" style={{ maxWidth:240 }} placeholder="🔍 Search product, region, farmer…" value={search} onChange={e => setSearch(e.target.value)} />
          <div>
            <select className="form-select" style={{ width:'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <select className="form-select" style={{ width:'auto' }} value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
              {GRADES.map(g => <option key={g}>Grade: {g}</option>)}
            </select>
          </div>
          <div>
            <select className="form-select" style={{ width:'auto' }} value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
              {REGIONS.map(r => <option key={r}>{r === 'All' ? 'All Regions' : r}</option>)}
            </select>
          </div>
          <div style={{ marginLeft:'auto' }}>
            <select className="form-select" style={{ width:'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="weight">Heaviest</option>
            </select>
          </div>
        </div>
      </div>

      <p className="text-muted text-sm" style={{ marginBottom:12 }}>{filtered.length} listing{filtered.length!==1?'s':''} found</p>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <div className="empty-title">No listings match your filters</div>
          <div className="empty-desc">Try adjusting your search or filters</div>
        </div>
      )}

      <div className="product-grid">
        {filtered.map(l => (
          <div
            key={l.id}
            className="product-card"
            onClick={() => navigate(`/marketplace/${l.id}`)}
          >
            <ProductThumb productType={l.batch.productType} />
            <div className="product-info">
              <div className="product-name">{l.batch.productType} — {l.batch.weight} kg</div>
              <div className="product-meta">
                Grade <strong>{l.batch.grade}</strong> · {l.batch.region}<br />
                Farmer: {l.farmer?.name}<br />
                {l.description && <em style={{fontSize:12}}>"{l.description.slice(0,60)}{l.description.length>60?'…':''}"</em>}
              </div>
              <div className="product-footer">
                <span className="product-price">M{l.price.toLocaleString()}</span>
                <span style={{ display:'flex', gap:4, alignItems:'center' }}>
                  <span style={{ fontSize:11, background:'var(--success-light)', color:'var(--success)', padding:'2px 7px', borderRadius:99, fontWeight:600 }}>✓ Verified</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
