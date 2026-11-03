import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { links } from '../data'

<<<<<<< HEAD
export default function Navbar({ isAdmin = false }) {
  const adminLinks = links.filter(
    ([path]) => path !== '/admissions'
  )

  return (
    <header className="site-nav">

      <Link
        className="brand"
        to="/"
        aria-label="Alice Public School home"
      >
        Alice Public School
      </Link>

      <nav aria-label="Main navigation">

        {(isAdmin ? adminLinks : links).map(
          ([path, label]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
            >
              {label}
            </NavLink>
          )
        )}

        {isAdmin && (
          <NavLink to="/admin">
            Admin Dashboard
          </NavLink>
        )}

      </nav>

      <a
        className="call-school"
        href="tel:+919899137983"
      >
        Call School
      </a>

=======
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="site-nav">
      <Link className="brand" to="/" aria-label="Alice Public School home" onClick={() => setMenuOpen(false)}>
        <img src="/alice-school-logo.jpg" alt="" />
        <span>Alice Public School</span>
      </Link>
      <button
        className="nav-toggle"
        type="button"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-controls="primary-navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
      </button>
      <nav id="primary-navigation" className={menuOpen ? 'open' : ''} aria-label="Main navigation">
        {links.map(([path, label]) => path.includes('#') ? (
          <Link
            key={path}
            to={path}
            className={location.pathname === '/' && location.hash === path.slice(path.indexOf('#')) ? 'active' : undefined}
            onClick={() => {
              setMenuOpen(false)
              if (location.pathname === '/') {
                requestAnimationFrame(() => document.getElementById(path.slice(path.indexOf('#') + 1))?.scrollIntoView({ behavior: 'smooth' }))
              }
            }}
          >{label}</Link>
        ) : (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => isActive && (path !== '/' || !location.hash) ? 'active' : undefined}
            onClick={() => setMenuOpen(false)}
          >{label}</NavLink>
        ))}
        <a className="call-school" href="tel:+919899137983">Call School</a>
      </nav>
>>>>>>> acd5c80 (Adding admin feature)
    </header>
  )
}