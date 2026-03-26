import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'

// Pages
import Login            from './pages/Login'
import FarmerDashboard  from './pages/farmer/Dashboard'
import RegisterBatch    from './pages/farmer/RegisterBatch'
import MyBatches        from './pages/farmer/MyBatches'
import MyListings       from './pages/farmer/MyListings'
import Marketplace      from './pages/buyer/Marketplace'
import ProductDetail    from './pages/buyer/ProductDetail'
import BuyerOrders      from './pages/buyer/Orders'
import VerifyBatch      from './pages/buyer/VerifyBatch'
import AgentDashboard   from './pages/agent/Dashboard'
import VerifyQueue      from './pages/agent/VerifyQueue'
import MinistryDashboard from './pages/ministry/Dashboard'
import FullLedger       from './pages/ministry/FullLedger'
import Reports          from './pages/ministry/Reports'

function Protected({ children, roles }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"            element={<Login />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/:id" element={<ProductDetail />} />
        <Route path="/verify"      element={<VerifyBatch />} />

        {/* Farmer */}
        <Route path="/farmer"          element={<Protected roles={['farmer']}><FarmerDashboard /></Protected>} />
        <Route path="/farmer/register" element={<Protected roles={['farmer']}><RegisterBatch /></Protected>} />
        <Route path="/farmer/batches"  element={<Protected roles={['farmer']}><MyBatches /></Protected>} />
        <Route path="/farmer/listings" element={<Protected roles={['farmer']}><MyListings /></Protected>} />

        {/* Agent */}
        <Route path="/agent"        element={<Protected roles={['agent']}><AgentDashboard /></Protected>} />
        <Route path="/agent/verify" element={<Protected roles={['agent']}><VerifyQueue /></Protected>} />

        {/* Buyer */}
        <Route path="/buyer/orders" element={<Protected roles={['buyer']}><BuyerOrders /></Protected>} />
        <Route path="/buyer/verify" element={<Protected roles={['buyer']}><VerifyBatch /></Protected>} />

        {/* Ministry */}
        <Route path="/ministry"         element={<Protected roles={['ministry']}><MinistryDashboard /></Protected>} />
        <Route path="/ministry/ledger"  element={<Protected roles={['ministry']}><FullLedger /></Protected>} />
        <Route path="/ministry/reports" element={<Protected roles={['ministry']}><Reports /></Protected>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
