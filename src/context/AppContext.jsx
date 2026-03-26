import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { db } from '../utils/db'
import { sha256 } from '../utils/crypto'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export function AppProvider({ children }) {
  const [user, setUser]     = useState(() => {
    const s = localStorage.getItem('lsagriflow_session')
    return s ? JSON.parse(s) : null
  })
  const [toasts, setToasts] = useState([])

  // expose db to crypto util for transaction chaining
  useEffect(() => { window.__lsagriflow__ = { db } }, [])

  const login = useCallback((phone, pin) => {
    const users = db.getAll('users')
    const found = users.find(u => u.phone === phone && u.pin === sha256({ pin }))
    if (!found) return false
    const { pin: _, ...safe } = found
    localStorage.setItem('lsagriflow_session', JSON.stringify(safe))
    setUser(safe)
    return true
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('lsagriflow_session')
    setUser(null)
  }, [])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  // helper: get display name for any userId
  const userName = useCallback((id) => {
    const u = db.getById('users', id)
    return u ? u.name : id
  }, [])

  return (
    <AppCtx.Provider value={{ user, login, logout, toast, userName, db }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && '✓'} {t.type === 'error' && '✕'} {t.type === 'info' && 'ℹ'} {t.msg}
          </div>
        ))}
      </div>
    </AppCtx.Provider>
  )
}
