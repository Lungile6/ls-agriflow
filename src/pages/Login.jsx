import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { MokorotloMark, TAGLINE } from '../components/Logo'

const ROLES = [
  { id: 'farmer',   icon: '👨‍🌾', label: 'Farmer',   phone: '26600001' },
  { id: 'agent',    icon: '🔍', label: 'Agent',    phone: '26600010' },
  { id: 'buyer',    icon: '🛒', label: 'Buyer',    phone: '26600020' },
  { id: 'ministry', icon: '🏛', label: 'Ministry', phone: '26600030' },
]
const ROLE_ROUTES = { farmer: '/farmer', agent: '/agent', buyer: '/marketplace', ministry: '/ministry' }

export default function Login() {
  const { login, toast } = useApp()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('farmer')
  const [phone, setPhone] = useState('26600001')
  const [pin, setPin] = useState('1234')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  function handleRoleSelect(role) {
    const r = ROLES.find(x => x.id === role)
    setSelectedRole(role)
    setPhone(r.phone)
    setPin('1234')
    setErr('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const ok = login(phone.trim(), pin.trim())
    setLoading(false)
    if (ok) {
      toast("Kena ka khotso! Welcome back.", 'success')
      navigate(ROLE_ROUTES[selectedRole] || '/')
    } else {
      setErr('Invalid phone number or PIN. Check demo credentials below.')
    }
  }

  return (
    <div className="login-page">
      <div style={{ width: '100%', maxWidth: 460 }}>

        <div style={{
          textAlign: 'center', marginBottom: 22, padding: '28px 24px 22px',
          background: 'rgba(255,255,255,0.08)', borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.14)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <MokorotloMark size={56} color="#FFFFFF" />
          </div>
          <div style={{ fontWeight: 900, fontSize: 30, color: '#FFFFFF', letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>
            LS<span style={{ fontWeight: 300, opacity: 0.75 }}>-</span>AgriFlow
          </div>
          <div style={{ fontStyle: 'italic', fontSize: 13.5, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>
            {TAGLINE}
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.5px' }}>
            From farm to market · Lesotho Supply Chain Platform
          </div>
        </div>

        <div className="login-card">
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Select your role
            </p>
            <div className="role-selector">
              {ROLES.map(r => (
                <button key={r.id} className={`role-btn ${selectedRole === r.id ? 'active' : ''}`} onClick={() => handleRoleSelect(r.id)}>
                  <div className="role-icon">{r.icon}</div>
                  <div className="role-name">{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="266XXXXXXXX" required />
            </div>
            <div className="form-group">
              <label className="form-label">PIN</label>
              <input className="form-input" type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="••••" required />
            </div>
            {err && <p className="form-error" style={{ marginBottom: 10 }}>⚠ {err}</p>}
            <button className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? '⏳ Signing in...' : `Sign in as ${ROLES.find(r => r.id === selectedRole)?.label}`}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
            <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>DEMO CREDENTIALS — all use PIN: 1234</p>
            {ROLES.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: 'var(--text-muted)' }}>
                <span>{r.icon} {r.label}</span><span className="font-mono">{r.phone}</span>
              </div>
            ))}
            <p style={{ marginTop: 6, color: 'var(--text-muted)' }}>Extra farmers: 26600002, 26600003 · Buyer 2: 26600021</p>
          </div>

          <p style={{ marginTop: 14, fontSize: 10.5, color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'monospace' }}>
            Contract: LSAgriFlow_Supply_v1 · Chain: LS-Ledger Simulated
          </p>
        </div>
      </div>
    </div>
  )
}
