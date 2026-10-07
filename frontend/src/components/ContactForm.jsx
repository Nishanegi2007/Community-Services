export default function EventCard({ day, month, title, place }) {
  return (<div className="card event"><div className="date"><b>{day}</b>{month}</div><div><h4>{title}</h4><small>📍 {place}</small></div></div>)
}
