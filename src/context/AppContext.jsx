import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { db } from '../utils/db'
import { sha256 } from '../utils/crypto'
import { Web3Manager } from '../utils/web3'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('lsagriflow_session')
    return s ? JSON.parse(s) : null
  })
  const [wallet, setWallet] = useState(null)
  const [web3Manager, setWeb3Manager] = useState(null)
  const [useBlockchain, setUseBlockchain] = useState(false)
  const [toasts, setToasts] = useState([])

  // expose db to crypto util for transaction chaining
  useEffect(() => { window.__lsagriflow__ = { db } }, [])

  const connectWallet = useCallback(async () => {
    try {
      const manager = new Web3Manager()
      const address = await manager.connectMetaMask()
      setWeb3Manager(manager)
      setWallet(address)
      setUseBlockchain(true)
      toast('Wallet connected successfully!', 'success')
      return address
    } catch (error) {
      toast('Failed to connect wallet: ' + error.message, 'error')
      throw error
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setWallet(null)
    setWeb3Manager(null)
    setUseBlockchain(false)
    toast('Wallet disconnected', 'info')
  }, [])

  const login = useCallback(async (phone, pin) => {
    const users = db.getAll('users')
    const found = users.find(u => u.phone === phone && u.pin === sha256({ pin }))
    if (!found) return false
    
    const { pin: _, ...safe } = found
    localStorage.setItem('lsagriflow_session', JSON.stringify(safe))
    setUser(safe)
    
    // Try to auto-connect wallet if user has one
    if (window.ethereum && !wallet) {
      try {
        await connectWallet()
      } catch (e) {
        // Wallet connection failed, continue with localStorage
        console.log('Auto wallet connection failed, using localStorage')
      }
    }
    
    return true
  }, [wallet, connectWallet])

  const logout = useCallback(() => {
    localStorage.removeItem('lsagriflow_session')
    setUser(null)
    disconnectWallet()
  }, [disconnectWallet])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const userName = useCallback((id) => {
    const u = db.getById('users', id)
    return u ? u.name : id
  }, [])

  return (
    <AppCtx.Provider value={{ 
      user, 
      wallet, 
      web3Manager, 
      useBlockchain,
      connectWallet, 
      disconnectWallet,
      login, 
      logout, 
      toast, 
      userName, 
      db 
    }}>
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
