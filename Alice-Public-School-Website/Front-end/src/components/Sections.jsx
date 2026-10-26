import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { BASE, stages, facilities, pics, news, steps } from '../data.js'

export function About() {
  return (
    <section id="about"><div className="wrap">
      <h2>About Us</h2>
      <p className="lead">Alice Public School was founded to give every family in our community access to a well-rounded education. We teach the curriculum well, and we also make room for sport, music, science and service.</p>
      <div className="stats">
        {[['25+', 'years of teaching'], ['1,200', 'students'], ['1:25', 'teacher to student ratio'], ['60', 'teachers and staff']].map(([n, l]) => <div key={l}><b>{n}</b>{l}</div>)}
      </div>
      <div className="grid">
        <div className="card"><h3>Our mission</h3><p>To help every child learn with curiosity, act with honesty and serve the community.</p></div>
        <div className="card"><h3>Our values</h3><p>Respect, discipline, inclusion and care for the environment guide daily school life.</p></div>
        <div className="card"><h3>Our history</h3><p>We began with one building and 80 students. Today we run a full campus with Nursery to Grade 12.</p></div>
      </div>
    </div></section>
  )
}

export function Principal() {
  return (
    <section id="principal" className="alt"><div className="wrap msg">
      <div className="avatar"><img src={BASE + 'principal.jpg'} alt="Portrait of Principal Anju Rajput" width="200" height="200" /></div>
      <div>
        <h2>Principal's Message</h2>
        <blockquote>School should be a place where a child feels safe enough to ask a question and brave enough to try the answer.</blockquote>
        <p>Dear parents and students, welcome to Alice Public School. Our teachers work hard to know each child's strengths and to help each one grow. We invite you to visit the campus, meet our staff and see how we teach.</p>
        <p><b>Anju Rajput</b><br /><small>Principal, Alice Public School</small></p>
      </div>
    </div></section>
  )
}

export function Academics() {
  const [i, setI] = useState(0)
  const [name, grades, text] = stages[i]
  return (
    <section id="academics"><div className="wrap">
      <h2>Academic Programs</h2>
      <p className="lead">Choose a stage to see what students learn.</p>
      <div className="tabs" role="tablist">
        {stages.map((s, j) => <button key={s[0]} role="tab" className="tab" aria-selected={i === j} onClick={() => setI(j)}>{s[0]}</button>)}
      </div>
      <div className="card panel" role="tabpanel">
        <h3>{name} <small>({grades})</small></h3><p>{text}</p>
      </div>
    </div></section>
  )
}

export function Facilities() {
  return (
    <section id="facilities" className="alt"><div className="wrap">
      <h2>Campus Facilities</h2>
      <div className="grid">{facilities.map(([t, d]) => <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
    </div></section>
  )
}

export function Gallery() {
  const [sel, setSel] = useState(null)
  const [events, setEvents] = useState([])
  const [albums, setAlbums] = useState([])
  const [updates, setUpdates] = useState([])
  useEffect(() => {
    api('/events').then(setEvents).catch(() => {})
    api('/gallery').then(setAlbums).catch(() => {})
    api('/news').then(setUpdates).catch(() => {})
  }, [])
  const eventPhotos = events.filter(e => e.imageUrl).map(e => [e.title, e.imageUrl])
  const albumPhotos = albums.flatMap(a => (a.images || []).map(url => [a.title, url]))
  const photos = [...albumPhotos, ...eventPhotos]
  const shownPhotos = photos.length ? photos : pics
  const newsList = updates.length ? updates.slice(0, 6).map(n => [n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '', n.title + ((n.message || n.description) ? ': ' + (n.message || n.description) : '')]) : (events.length ? events.slice(0, 6).map(e => [e.date, e.title + (e.description ? ': ' + e.description : '')]) : news)
  const bg = (url) => ({ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.65), transparent 55%), url(${url})` })
  return <section id="gallery"><div className="wrap"><h2>Photo Gallery & News</h2><p className="lead">School moments, announcements and recent events.</p><div className="gallery">{shownPhotos.map(([t, url], i) => <button key={`${t}-${url}-${i}`} className="tile" style={bg(url)} onClick={() => setSel([t, url])}>{t}</button>)}</div><h3 style={{ marginTop: 36 }}>News & announcements</h3><ul className="news">{newsList.map(([d, t], i) => <li key={i}><time>{d}</time><span>{t}</span></li>)}</ul>{sel && <div className="modal" role="dialog" aria-modal="true" aria-label={sel[0]} onClick={() => setSel(null)}><div className="box" onClick={e => e.stopPropagation()}><div className="shot" style={bg(sel[1])}/><div className="cap"><p>{sel[0]} at Alice Public School.</p><button className="btn" autoFocus onClick={() => setSel(null)}>Close</button></div></div></div>}</div></section>
}

export function Admissions() {
  return (
    <section id="admissions" className="alt"><div className="wrap">
      <h2>Admissions Guide</h2>
      <p className="lead">Four steps from enquiry to first day.</p>
      <ol className="steps">{steps.map(([t, d]) => <li key={t}><div><b>{t}</b>{d}</div></li>)}</ol>
    </div></section>
  )
}
