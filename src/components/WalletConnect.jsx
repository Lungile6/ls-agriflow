import React from 'react'
import { useApp } from '../context/AppContext'

export default function WalletConnect() {
  const { wallet, connectWallet, disconnectWallet, useBlockchain } = useApp()

  if (wallet) {
    return (
      <div className="wallet-connected">
        <span className="wallet-address">
          {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={disconnectWallet}>
          Disconnect
        </button>
        <span className={`blockchain-status ${useBlockchain ? 'active' : 'inactive'}`}>
          {useBlockchain ? '⛓ Blockchain' : '📱 Local'}
        </span>
      </div>
    )
  }

  return (
    <button className="btn btn-primary btn-sm" onClick={connectWallet}>
      🔗 Connect MetaMask
    </button>
  )
}