import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Gallery() {
  const [photos, setPhotos] = useState([])
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/gallery').then(({ photos: items }) => setPhotos(items)).catch((reason) => setError(reason.message))
  }, [])

  const categories = ['All', ...new Set(photos.map((photo) => photo.category))]
  const visiblePhotos = category === 'All' ? photos : photos.filter((photo) => photo.category === category)
  if (error) return <p role="status">{error}</p>
  if (!photos.length) return <p>Photos from school events will appear here.</p>

  return <>
    <div className="chips">{categories.map((item) => <button key={item} className={item === category ? 'chip on' : 'chip'} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <div className="gal">{visiblePhotos.map((photo) => <button key={photo._id} className="shot" onClick={() => setSelected(photo)}><img src={photo.imageUrl} alt={photo.title || photo.category} loading="lazy" /><span>{photo.title || photo.category}</span></button>)}</div>
    {selected && <div className="lb" onClick={() => setSelected(null)}><img src={selected.imageUrl} alt={selected.title || selected.category} /><button aria-label="Close photo" onClick={() => setSelected(null)}>✕</button></div>}
  </>
}
