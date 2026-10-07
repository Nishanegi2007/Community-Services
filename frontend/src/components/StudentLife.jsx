import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { links } from '../data'
export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="nav">
      <Link to="/" className="logo" onClick={() => setOpen(false)}>🌈 Bright Future</Link>
      <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
      <nav className={open ? 'open' : ''}>
        {links.map(([to, name]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>{name}</NavLink>)}
      </nav>
    </header>
  )
}
