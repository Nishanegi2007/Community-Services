import { useState } from 'react'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import './admin.css'

// The admin page decides what to show: login screen or dashboard.
export default function Admin() {
  // The login token is saved in the browser, so a refresh keeps the admin logged in
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem('adminToken')))

  const logout = () => {
    localStorage.removeItem('adminToken')
    setLoggedIn(false)
  }

  return (
    <div className="adm">
      {loggedIn ? <Dashboard onLogout={logout} /> : <Login onLogin={() => setLoggedIn(true)} />}
    </div>
  )
}
