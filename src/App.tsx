import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { MapPage } from '@/pages/MapPage'
import { AdminPage } from '@/pages/AdminPage'
import { LoginPage } from '@/pages/LoginPage'

function AdminRoute() {
  const [secret, setSecret] = useState<string | null>(
    sessionStorage.getItem('admin_secret')
  )
  const navigate = useNavigate()

  if (!secret) {
    return <LoginPage onLogin={(s) => setSecret(s)} />
  }

  return (
    <AdminPage
      onLogout={() => {
        sessionStorage.removeItem('admin_secret')
        setSecret(null)
        navigate('/')
      }}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  )
}
