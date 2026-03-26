import { db, isSeeded, markSeeded } from './db'
import { sha256, generateId, hashBatch } from './crypto'

function pw(pin) { return sha256({ pin }) }

export function seedData() {
  if (isSeeded()) return

  // ── Users ──────────────────────────────────────────────────────────────
  const users = [
    { id: 'USR-F001', name: 'Lineo Mokoena', phone: '26600001', pin: pw('1234'), role: 'farmer', district: 'Quthing', association: 'LNWMGA-Q', createdAt: '2024-08-10T08:00:00Z' },
    { id: 'USR-F002', name: 'Thabo Letsie',  phone: '26600002', pin: pw('1234'), role: 'farmer', district: 'Maseru',  association: 'LNWMGA-M', createdAt: '2024-09-01T08:00:00Z' },
    { id: 'USR-F003', name: 'Palesa Ntho',   phone: '26600003', pin: pw('1234'), role: 'farmer', district: 'Mokhotlong', association: 'LNWMGA-Mk', createdAt: '2024-09-15T08:00:00Z' },
    { id: 'USR-A001', name: 'Mosa Tau',      phone: '26600010', pin: pw('1234'), role: 'agent',   district: 'Quthing', createdAt: '2024-07-01T08:00:00Z' },
    { id: 'USR-B001', name: 'Cape Wool Co.', phone: '26600020', pin: pw('1234'), role: 'buyer',   country: 'South Africa', company: 'Cape Wool Co.', createdAt: '2024-06-01T08:00:00Z' },
    { id: 'USR-B002', name: 'Mohair World',  phone: '26600021', pin: pw('1234'), role: 'buyer',   country: 'UK', company: 'Mohair World Ltd', createdAt: '2024-06-15T08:00:00Z' },
    { id: 'USR-M001', name: 'Dr. Ntoi Rapapa', phone: '26600030', pin: pw('1234'), role: 'ministry', title: 'Director of Agricultural Markets', createdAt: '2024-05-01T08:00:00Z' },
  ]
  users.forEach(u => db.insert('users', u))

  // ── Batches ────────────────────────────────────────────────────────────
  const batchData = [
    { id: 'BATCH-KX7A-F001', farmerId: 'USR-F001', productType: 'Wool',   weight: 120, grade: 'A', region: 'Quthing', harvestDate: '2024-10-05', description: 'Fine merino wool, hand-sheared', status: 'VERIFIED',  createdAt: '2024-10-06T09:00:00Z' },
    { id: 'BATCH-KX7B-F001', farmerId: 'USR-F001', productType: 'Mohair', weight: 85,  grade: 'A', region: 'Quthing', harvestDate: '2024-10-08', description: 'Premium kid mohair, first clip', status: 'LISTED',    createdAt: '2024-10-09T10:00:00Z' },
    { id: 'BATCH-KX7C-F001', farmerId: 'USR-F001', productType: 'Wool',   weight: 200, grade: 'B', region: 'Quthing', harvestDate: '2024-10-15', description: 'Crossbred wool, good condition', status: 'PENDING',   createdAt: '2024-10-16T11:00:00Z' },
    { id: 'BATCH-KX8A-F002', farmerId: 'USR-F002', productType: 'Mohair', weight: 150, grade: 'A+', region: 'Maseru', harvestDate: '2024-10-10', description: 'Top-grade adult mohair', status: 'SOLD',      createdAt: '2024-10-11T08:00:00Z' },
    { id: 'BATCH-KX8B-F002', farmerId: 'USR-F002', productType: 'Wool',   weight: 90,  grade: 'A', region: 'Maseru', harvestDate: '2024-10-18', description: 'Fine wool, well-sorted', status: 'VERIFIED',  createdAt: '2024-10-19T09:00:00Z' },
    { id: 'BATCH-KX9A-F003', farmerId: 'USR-F003', productType: 'Mohair', weight: 60,  grade: 'B', region: 'Mokhotlong', harvestDate: '2024-10-20', description: 'Second clip mohair', status: 'PENDING',   createdAt: '2024-10-21T07:00:00Z' },
    { id: 'BATCH-KX9B-F003', farmerId: 'USR-F003', productType: 'Wool',   weight: 175, grade: 'A', region: 'Mokhotlong', harvestDate: '2024-10-22', description: 'Highland fine wool', status: 'REJECTED',  createdAt: '2024-10-23T08:30:00Z' },
  ]
  batchData.forEach(b => {
    b.hash = hashBatch(b)
    db.insert('batches', b)
  })

  // ── Listings ───────────────────────────────────────────────────────────
  const listings = [
    { id: 'LST-001', batchId: 'BATCH-KX7B-F001', farmerId: 'USR-F001', price: 4250, currency: 'LSL', description: 'Premium kid mohair, first clip. Suitable for luxury textile export.', status: 'ACTIVE', createdAt: '2024-10-10T10:00:00Z' },
    { id: 'LST-002', batchId: 'BATCH-KX8A-F002', farmerId: 'USR-F002', price: 9500, currency: 'LSL', description: 'Top-grade adult mohair, highest luster.', status: 'SOLD',   createdAt: '2024-10-12T08:00:00Z' },
    { id: 'LST-003', batchId: 'BATCH-KX8B-F002', farmerId: 'USR-F002', price: 5800, currency: 'LSL', description: 'Well-sorted fine wool from Maseru lowlands.', status: 'ACTIVE', createdAt: '2024-10-20T09:00:00Z' },
  ]
  listings.forEach(l => db.insert('listings', l))

  // ── Orders ─────────────────────────────────────────────────────────────
  db.insert('orders', { id: 'ORD-001', listingId: 'LST-002', batchId: 'BATCH-KX8A-F002', buyerId: 'USR-B001', sellerId: 'USR-F002', price: 9500, currency: 'LSL', status: 'COMPLETED', createdAt: '2024-10-22T10:00:00Z' })

  // ── Transactions (the blockchain ledger) ───────────────────────────────
  const now = new Date()
  function dt(daysAgo, hoursAgo = 0) {
    const d = new Date(now); d.setDate(d.getDate() - daysAgo); d.setHours(d.getHours() - hoursAgo); return d.toISOString()
  }

  const rawTxns = [
    { id: 'TX-0001', type: 'REGISTER', batchId: 'BATCH-KX7A-F001', actorId: 'USR-F001', actorRole: 'farmer', data: { note: 'Initial batch registration' }, timestamp: dt(22), prevHash: '0000000000000000' },
    { id: 'TX-0002', type: 'VERIFY',   batchId: 'BATCH-KX7A-F001', actorId: 'USR-A001', actorRole: 'agent',  data: { grade: 'A', notes: 'Passed quality check' }, timestamp: dt(21), prevHash: '' },
    { id: 'TX-0003', type: 'REGISTER', batchId: 'BATCH-KX7B-F001', actorId: 'USR-F001', actorRole: 'farmer', data: { note: 'Initial batch registration' }, timestamp: dt(19), prevHash: '' },
    { id: 'TX-0004', type: 'VERIFY',   batchId: 'BATCH-KX7B-F001', actorId: 'USR-A001', actorRole: 'agent',  data: { grade: 'A', notes: 'Excellent fibre quality' }, timestamp: dt(18), prevHash: '' },
    { id: 'TX-0005', type: 'LIST',     batchId: 'BATCH-KX7B-F001', actorId: 'USR-F001', actorRole: 'farmer', data: { price: 4250, listingId: 'LST-001' }, timestamp: dt(18, 2), prevHash: '' },
    { id: 'TX-0006', type: 'REGISTER', batchId: 'BATCH-KX8A-F002', actorId: 'USR-F002', actorRole: 'farmer', data: { note: 'Initial batch registration' }, timestamp: dt(17), prevHash: '' },
    { id: 'TX-0007', type: 'VERIFY',   batchId: 'BATCH-KX8A-F002', actorId: 'USR-A001', actorRole: 'agent',  data: { grade: 'A+', notes: 'Superior lustre, no contamination' }, timestamp: dt(16), prevHash: '' },
    { id: 'TX-0008', type: 'LIST',     batchId: 'BATCH-KX8A-F002', actorId: 'USR-F002', actorRole: 'farmer', data: { price: 9500, listingId: 'LST-002' }, timestamp: dt(16, 1), prevHash: '' },
    { id: 'TX-0009', type: 'PURCHASE', batchId: 'BATCH-KX8A-F002', actorId: 'USR-B001', actorRole: 'buyer',  data: { orderId: 'ORD-001', price: 9500 }, timestamp: dt(6), prevHash: '' },
    { id: 'TX-0010', type: 'CERTIFY',  batchId: 'BATCH-KX8A-F002', actorId: 'USR-B001', actorRole: 'buyer',  data: { certId: 'CERT-001', orderId: 'ORD-001' }, timestamp: dt(5), prevHash: '' },
    { id: 'TX-0011', type: 'REGISTER', batchId: 'BATCH-KX7C-F001', actorId: 'USR-F001', actorRole: 'farmer', data: { note: 'Awaiting agent verification' }, timestamp: dt(12), prevHash: '' },
    { id: 'TX-0012', type: 'REGISTER', batchId: 'BATCH-KX8B-F002', actorId: 'USR-F002', actorRole: 'farmer', data: { note: 'Initial batch registration' }, timestamp: dt(9),  prevHash: '' },
    { id: 'TX-0013', type: 'VERIFY',   batchId: 'BATCH-KX8B-F002', actorId: 'USR-A001', actorRole: 'agent',  data: { grade: 'A', notes: 'Good quality' }, timestamp: dt(8), prevHash: '' },
    { id: 'TX-0014', type: 'LIST',     batchId: 'BATCH-KX8B-F002', actorId: 'USR-F002', actorRole: 'farmer', data: { price: 5800, listingId: 'LST-003' }, timestamp: dt(8, 1), prevHash: '' },
    { id: 'TX-0015', type: 'REGISTER', batchId: 'BATCH-KX9A-F003', actorId: 'USR-F003', actorRole: 'farmer', data: { note: 'Awaiting verification' }, timestamp: dt(7), prevHash: '' },
    { id: 'TX-0016', type: 'REGISTER', batchId: 'BATCH-KX9B-F003', actorId: 'USR-F003', actorRole: 'farmer', data: { note: 'Batch submitted for review' }, timestamp: dt(5), prevHash: '' },
    { id: 'TX-0017', type: 'REJECT',   batchId: 'BATCH-KX9B-F003', actorId: 'USR-A001', actorRole: 'agent',  data: { reason: 'Contamination detected — vegetable matter present' }, timestamp: dt(4), prevHash: '' },
  ]

  // Chain them: each tx prevHash points to previous tx hash
  rawTxns[0].hash = sha256({ ...rawTxns[0] })
  for (let i = 1; i < rawTxns.length; i++) {
    rawTxns[i].prevHash = rawTxns[i - 1].hash
    rawTxns[i].hash = sha256({ ...rawTxns[i] })
  }
  rawTxns.forEach(tx => db.insert('transactions', tx))

  // ── Export Certificate ─────────────────────────────────────────────────
  db.insert('certificates', {
    id: 'CERT-001', batchId: 'BATCH-KX8A-F002', orderId: 'ORD-001', buyerId: 'USR-B001', farmerId: 'USR-F002',
    proofHash: rawTxns[rawTxns.length - 1].hash,
    issuedAt: dt(5), issuedBy: 'LSAgriFlow_Supply_v1',
  })

  markSeeded()
}
