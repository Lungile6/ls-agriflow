import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { AppProvider } from './context/AppContext'
import { seedData } from './utils/seed'

// Seed demo data on first load
seedData()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
)
