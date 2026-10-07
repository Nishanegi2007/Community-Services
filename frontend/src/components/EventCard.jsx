import { Link } from 'react-router-dom'
import { links } from '../data'
export default function Footer() {
  const [done, setDone] = useState(false)
  return (
    <footer className="footer">
      <div className="wrap grid3">
        <div><h3>🌈 Bright Future School</h3><p>Where every child learns, plays and shines.</p><p>📘 📸 ▶️ 🐦</p></div>
        <div><h3>Quick Links</h3>{links.map(([to, n]) => <Link key={to} to={to}>{n}</Link>)}</div>
        <div><h3>Newsletter</h3>
          {done ? <p>🎉 Thanks for subscribing!</p> :
            <form onSubmit={e => { e.preventDefault(); setDone(true) }} className="inline"><input type="email" required placeholder="Your email" /><button className="btn">Join</button></form>}
        </div>
      </div>
      <p className="copy">© 2026 Bright Future School. All rights reserved.</p>
    </footer>
  )
}
import { useState } from 'react'
