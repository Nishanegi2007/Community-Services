import { useState } from 'react'
import { links } from '../data.js'

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header>
      <div className="wrap bar">
        <a className="logo" href="#top">Alice <span>Public School</span></a>
        <button id="menu" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>Menu</button>
        <nav id="nav" className={open ? 'open' : ''}>
          {links.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}
          <a className="btn" href="#contact" onClick={() => setOpen(false)}>Contact us</a>
        </nav>
      </div>
    </header>
  )
}
