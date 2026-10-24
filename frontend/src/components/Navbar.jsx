import { Link, NavLink } from 'react-router-dom'
import { links } from '../data'

export default function Navbar() {
  return (
    <header className="site-nav">
      <Link className="brand" to="/" aria-label="Alice Public School home">Alice Public School</Link>
      <nav aria-label="Main navigation">
        {links.map(([path, label]) => <NavLink key={path} to={path}>{label}</NavLink>)}
      </nav>
      <a className="call-school" href="tel:+919899137983">Call School</a>
    </header>
  )
}
