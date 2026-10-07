import { useState } from 'react'
export default function ContactForm({ admission }) {
  const [sent, setSent] = useState(false)
  const f = admission ? [['Student Name', 'text'], ['Parent Name', 'text']] : [['Your Name', 'text']]
  if (sent) return <div className="card ok">🎉 Thank you! We will contact you soon.</div>
  return (
    <form className="card form" onSubmit={e => { e.preventDefault(); setSent(true) }}>
      {f.map(([l, t]) => <label key={l}>{l}<input type={t} required /></label>)}
      {admission && <label>Class<select required><option value="">Select class</option>{[1, 2, 3, 4, 5].map(c => <option key={c}>Class {c}</option>)}</select></label>}
      <label>Phone Number<input type="tel" required pattern="[0-9]{10}" title="10 digit number" /></label>
      <label>Email<input type="email" required /></label>
      <label>Message<textarea rows="4" /></label>
      <button className="btn">{admission ? 'Apply Now' : 'Send Message'}</button>
    </form>
  )
}
