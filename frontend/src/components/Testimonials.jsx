import { clubs } from '../data'
export default function StudentLife() {
  return (<div className="grid4">{clubs.map(([i, n, d, c]) => <div key={n} className={'card tile ' + c}><div className="ico">{i}</div><h4>{n}</h4><p>{d}</p></div>)}</div>)
}
