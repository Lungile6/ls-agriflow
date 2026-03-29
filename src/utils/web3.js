import { ethers } from 'ethers'
import contractInfo from '../../artifacts/contracts/LSAgriFlow_Supply_v1.sol/LSAgriFlow_Supply_v1.json'

// Vite uses import.meta.env instead of process.env
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL;

export class Web3Manager {
  constructor() {
    this.provider = null
    this.signer = null
    this.contract = null
    this.connected = false
  }

  async connectMetaMask() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.')
    }

    // Safety check for the contract address
    if (!CONTRACT_ADDRESS) {
      throw new Error('VITE_CONTRACT_ADDRESS is missing in .env file')
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      const sepoliaChainId = '0xaa36a7' 
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      if (currentChainId !== sepoliaChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }]
          })
        } catch (switchError) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: sepoliaChainId,
              chainName: 'Sepolia Testnet',
              rpcUrls: [SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          })
        }
      }

      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()

      // FIX: Use the address from .env, and the ABI from the artifact
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractInfo.abi,
        this.signer
      )
      
      this.connected = true
      return await this.signer.getAddress()
    } catch (error) {
      console.error('Failed to connect MetaMask:', error)
      throw error
    }
  }

  async registerBatch(batchData) {
    if (!this.connected) throw new Error('Wallet not connected')
    
    try {
      // Ensure numerical values are handled correctly for Solidity
      const weightInKg = Math.floor(parseFloat(batchData.weight));

      const tx = await this.contract.registerBatch(
        batchData.id,
        batchData.productType,
        weightInKg,
        batchData.grade,
        batchData.region,
        batchData.harvestDate,
        batchData.description || ''
      )
      
      const receipt = await tx.wait()
      return receipt
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  async verifyBatch(batchId, grade, notes) {
    if (!this.connected) throw new Error('Wallet not connected')
    const tx = await this.contract.verifyBatch(batchId, grade, notes)
    return await tx.wait()
  }

  async getBatch(batchId) {
    if (!this.connected) throw new Error('Wallet not connected')
    return await this.contract.batches(batchId)
  }

  async getTransaction(txId) {
    if (!this.connected) throw new Error('Wallet not connected')
    return await this.contract.transactions(txId)
  }

  async getTransactionChain() {
    if (!this.connected) throw new Error('Wallet not connected')
    return await this.contract.getTransactionChain()
  }
}