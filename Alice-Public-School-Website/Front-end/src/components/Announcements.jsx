import { useEffect, useState } from 'react'
import { api } from '../api.js'

// Shows the latest announcements in a yellow bar at the top of the website
export default function Announcements() {
  const [items, setItems] = useState([])

  useEffect(() => {
    api('/announcements').then(setItems).catch(() => {}) // if the server is off, just show nothing
  }, [])

  if (items.length === 0) return null

  return (
    <div className="ann">
      <div className="wrap">
        {items.map((a) => (
          <p key={a.id}><span className="tag">{a.category}</span><b>{a.title}</b> {a.message}</p>
        ))}
      </div>
    </div>
  )
}
