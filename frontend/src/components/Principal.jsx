import { Link } from 'react-router-dom'
export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-in">
        <div>
          <h1>Bright Future School</h1>
          <p className="tag">Learn. Play. Shine. ✨</p>
          <p>A joyful school for Classes 1 to 5, where curiosity grows every day.</p>
          <div className="btns"><Link className="btn" to="/admissions">Apply for Admission</Link><Link className="btn alt" to="/about">Explore Our School</Link></div>
        </div>
        <div className="art" aria-hidden="true">🏫<span>🎒</span><span>✏️</span><span>⭐</span></div>
      </div>
    </section>
  )
}
