import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import NoticeBoard from '../components/NoticeBoard'
import EventCard from '../components/EventCard'
import Testimonials from '../components/Testimonials'
import { highlights, stats, activities, events, quote } from '../data'
import { useState } from 'react'
import { faqs, photos } from '../data'
export default function Home() {
  const [open, setOpen] = useState(0)
  return (<>
    <Hero />
    <section className="sec wrap"><h2>Welcome to our school</h2><p className="lead">Bright Future School has nurtured young learners since 2005 with love, play and great teaching.</p>
      <div className="grid5">{highlights.map(([i, t, d], k) => <div key={t} className={'card tile c' + ((k % 6) + 1)}><div className="ico">{i}</div><h4>{t}</h4><p>{d}</p></div>)}</div></section>
    <section className="stats"><div className="wrap grid4">{stats.map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}</div></section>
    <section className="sec wrap"><h2>Latest activities</h2><div className="grid3">{activities.map(([i, t, d]) => <div key={t} className="card tile"><div className="ico">{i}</div><h4>{t}</h4><p>{d}</p></div>)}</div></section>
    <section className="sec wrap"><h2>Our gallery</h2><div className="home-gal">{photos.slice(0, 6).map(p => <img key={p.id} src={p.src} alt={p.cat} loading="lazy" />)}</div><p className="center"><Link className="btn" to="/gallery">View Full Gallery</Link></p></section>
    <section className="sec wrap two"><div><h2>Upcoming events</h2>{events.map(e => <EventCard key={e[2]} day={e[0]} month={e[1]} title={e[2]} place={e[3]} />)}</div><NoticeBoard /></section>
    <section className="sec wrap two">
      <div className="card spot"><h3>🎂 Student Spotlight</h3><p><b>Aarav Mehta, Class 4</b> won the district drawing contest. Happy birthday this week to Siya and Kabir! 🎈</p></div>
      <div className="card qow"><h3>💬 Quote of the Week</h3><p>{quote[0]}</p><small>— {quote[1]}</small></div></section>
    <section className="sec wrap"><h2>What parents say</h2><Testimonials /></section>
    <section className="sec wrap narrow"><h2>FAQ</h2>{faqs.map(([q, a], i) => <div key={q} className="card faq"><button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>{q}<span>{open === i ? '−' : '+'}</span></button>{open === i && <p>{a}</p>}</div>)}
      <p className="center"><Link className="btn" to="/admissions">Apply for Admission</Link></p></section>
  </>)
}
