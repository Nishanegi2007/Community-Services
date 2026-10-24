import { clubs } from '../data'

export default function StudentLife() {
  return <div className="grid4">{clubs.map(([icon, name, description, color]) => <div key={name} className={`card tile ${color}`}><div className="ico">{icon}</div><h4>{name}</h4><p>{description}</p></div>)}</div>
}
