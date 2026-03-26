import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts'
import Layout from '../../components/Layout'
import { StatCard } from '../../components/common'
import { MokorotloMark, TAGLINE, CONTRACT_NAME } from '../../components/Logo'
import { useApp } from '../../context/AppContext'

const COLORS = ['#1F4E79', '#2E75B6', '#059669', '#D97706', '#7C3AED', '#DC2626']

export default function MinistryDashboard() {
  const { db } = useApp()
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [chartData, setChartData] = useState([])
  const [districtData, setDistrictData] = useState([])
  const [productData, setProductData] = useState([])
  const [gradeData, setGradeData] = useState([])

  useEffect(() => {
    const batches     = db.getAll('batches')
    const txns        = db.getAll('transactions')
    const farmers     = db.where('users', u => u.role === 'farmer')
    const buyers      = db.where('users', u => u.role === 'buyer')
    const orders      = db.getAll('orders')
    const certs       = db.getAll('certificates')
    const listings    = db.getAll('listings')

    const totalVolume = orders.reduce((s, o) => s + (o.price || 0), 0)
    const totalWeight = batches.reduce((s, b) => s + (b.weight || 0), 0)

    setStats({
      batches: batches.length,
      verified: batches.filter(b => ['VERIFIED','LISTED','SOLD'].includes(b.status)).length,
      pending: batches.filter(b => b.status === 'PENDING').length,
      rejected: batches.filter(b => b.status === 'REJECTED').length,
      txns: txns.length,
      farmers: farmers.length,
      buyers: buyers.length,
      orders: orders.length,
      certs: certs.length,
      volume: totalVolume,
      weight: totalWeight,
      listings: listings.filter(l => l.status === 'ACTIVE').length,
    })

    // Monthly registration chart (last 8 weeks)
    const weeks = []
    for (let i = 7; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i * 7)
      const label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
      const start = new Date(d); start.setDate(start.getDate() - 7)
      const end   = new Date(d)
      const reg   = txns.filter(t => t.type === 'REGISTER' && new Date(t.timestamp) >= start && new Date(t.timestamp) < end).length
      const ver   = txns.filter(t => t.type === 'VERIFY'   && new Date(t.timestamp) >= start && new Date(t.timestamp) < end).length
      const pur   = txns.filter(t => t.type === 'PURCHASE' && new Date(t.timestamp) >= start && new Date(t.timestamp) < end).length
      weeks.push({ week: label, Registrations: reg, Verifications: ver, Purchases: pur })
    }
    setChartData(weeks)

    // District breakdown
    const distMap = {}
    batches.forEach(b => { distMap[b.region] = (distMap[b.region] || 0) + 1 })
    setDistrictData(Object.entries(distMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))

    // Product split
    const wool   = batches.filter(b => b.productType === 'Wool').length
    const mohair = batches.filter(b => b.productType === 'Mohair').length
    setProductData([{ name: 'Wool 🐑', value: wool }, { name: 'Mohair 🐐', value: mohair }])

    // Grade distribution
    const gradeMap = {}
    batches.forEach(b => { gradeMap[b.grade] = (gradeMap[b.grade] || 0) + 1 })
    setGradeData(Object.entries(gradeMap).map(([name, value]) => ({ name: `Grade ${name}`, value })).sort((a,b) => a.name.localeCompare(b.name)))
  }, [])

  return (
    <Layout title="Ministry Dashboard">
      <div style={{ marginBottom: 20, display:'flex', alignItems:'center', gap:16 }}>
        <MokorotloMark size={44} color="var(--primary)" />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing:'-0.5px' }}>National LS-AgriFlow Overview</h2>
          <p className="text-muted" style={{fontStyle:'italic'}}>{TAGLINE}</p>
          <p className="text-muted text-sm">Live supply chain intelligence — Lesotho wool &amp; mohair sector · <span className="font-mono">{CONTRACT_NAME}</span></p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="stats-grid">
        <StatCard icon="📦" label="Total Batches"         value={stats.batches}           color="blue"    />
        <StatCard icon="✅" label="Verified / Listed"      value={stats.verified}          color="green"   />
        <StatCard icon="⏳" label="Pending Verification"   value={stats.pending}           color="warning" />
        <StatCard icon="👨‍🌾" label="Registered Farmers"   value={stats.farmers}           color="blue"    />
        <StatCard icon="🛒" label="Marketplace Orders"     value={stats.orders}            color="purple"  />
        <StatCard icon="📜" label="Certificates Issued"    value={stats.certs}             color="green"   />
        <StatCard icon="⛓" label="Ledger Transactions"    value={stats.txns}              color="blue"    />
        <StatCard icon="💰" label="Total Trade Volume"     value={`M${(stats.volume||0).toLocaleString()}`} color="green" />
        <StatCard icon="⚖" label="Total Weight Tracked"   value={`${(stats.weight||0).toLocaleString()} kg`} color="warning" />
        <StatCard icon="🏷" label="Active Listings"        value={stats.listings}          color="purple"  />
      </div>

      {/* Activity line chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Ledger Activity — Last 8 Weeks</span>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Registrations" stroke="#1F4E79" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Verifications" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Purchases"     stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom charts row */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {/* District bar */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header"><span className="card-title">Batches by Region</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={districtData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#2E75B6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product pie */}
        <div className="card">
          <div className="card-header"><span className="card-title">Product Split</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={productData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {productData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grade distribution */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Grade Distribution</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/ministry/reports')}>View Reports →</button>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1F4E79" radius={[4, 4, 0, 0]}>
                {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  )
}
