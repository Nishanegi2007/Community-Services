import { notices } from '../data'
export default function NoticeBoard() {
  return (<div className="card board"><h3>📌 Notice Board</h3>{notices.map(([d, t]) => <p key={t}><b>{d}</b> {t}</p>)}</div>)
}
