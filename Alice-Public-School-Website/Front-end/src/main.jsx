import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Admin from './admin/Admin.jsx'
import './styles.css'

// If the web address starts with /admin show the admin page, otherwise the school website
const isAdminPage = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')).render(isAdminPage ? <Admin /> : <App />)
