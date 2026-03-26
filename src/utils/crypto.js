import CryptoJS from 'crypto-js'

export function sha256(data) {
  return CryptoJS.SHA256(JSON.stringify(data)).toString()
}

export function generateId(prefix = '') {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substr(2, 5).toUpperCase()
  return prefix ? `${prefix}-${ts}-${rand}` : `${ts}-${rand}`
}

export function createTransaction(type, batchId, actorId, actorRole, data = {}) {
  const { db } = window.__lsagriflow__ || {}
  const txns = db ? db.getAll('transactions') : []
  const prevTx = txns[txns.length - 1]
  const prevHash = prevTx ? prevTx.hash : '0000000000000000'

  const payload = {
    id: generateId('TX'),
    type,
    batchId,
    actorId,
    actorRole,
    data,
    timestamp: new Date().toISOString(),
    prevHash,
  }
  payload.hash = sha256(payload)
  return payload
}

export function verifyChain(transactions) {
  for (let i = 1; i < transactions.length; i++) {
    const { hash, ...rest } = transactions[i]
    if (sha256(rest) !== hash) return false
    if (transactions[i].prevHash !== transactions[i - 1].hash) return false
  }
  return true
}

export function hashBatch(batch) {
  return sha256({
    farmerId: batch.farmerId,
    productType: batch.productType,
    weight: batch.weight,
    grade: batch.grade,
    region: batch.region,
    harvestDate: batch.harvestDate,
    timestamp: batch.createdAt,
  })
}
