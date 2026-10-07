import { useState } from 'react'
import { cats, photos } from '../data'
export default function Gallery() {
  const [cat, setCat] = useState('All'), [view, setView] = useState(null)
  const list = cat === 'All' ? photos : photos.filter(p => p.cat === cat)
  return (<>
    <div className="chips">{cats.map(c => <button key={c} className={c === cat ? 'chip on' : 'chip'} onClick={() => setCat(c)}>{c}</button>)}</div>
    <div className="gal">{list.map(p => <button key={p.id} className="shot" onClick={() => setView(p)}><img src={p.src} alt={p.cat} loading="lazy" /><span>{p.cat}</span></button>)}</div>
    {view && <div className="lb" onClick={() => setView(null)}><img src={view.src.replace('600/450', '1000/750')} alt={view.cat} /><button aria-label="Close">✕</button></div>}
  </>)
}
