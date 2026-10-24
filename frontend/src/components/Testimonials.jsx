import { testimonials } from '../data'

export default function Testimonials() {
  return <div className="grid3">{testimonials.map(([name, role, quote]) => <article className="card quote" key={name}><p>“{quote}”</p><small><b>{name}</b> · {role}</small></article>)}</div>
}
