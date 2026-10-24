import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function NoticeBoard() {
  const [announcements, setAnnouncements] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    api('/announcements').then(({ announcements: items }) => setAnnouncements(items)).catch((reason) => setError(reason.message))
  }, [])

  return <div className="card board"><h3>📌 Notice Board</h3>
    {error && <p role="status">{error}</p>}
    {!error && announcements.length === 0 && <p>No current announcements.</p>}
    {announcements.map((item) => <article key={item._id}><b>{new Date(item.publishAt).toLocaleDateString()}</b><h4>{item.title}</h4><p>{item.message}</p></article>)}
  </div>
}
