import { useState } from 'react'
import { api } from '../lib/api'

export default function ContactForm({ admission = false }) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setStatus('')
    setBusy(true)
    const form = event.currentTarget
    const fields = Object.fromEntries(new FormData(form))
    try {
      const result = await api('/inquiries', { method: 'POST', body: JSON.stringify(fields) })
      setStatus(result.message)
      form.reset()
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>{admission ? 'Admission enquiry' : 'Send us an enquiry'}</h2>
      <label>Your name<input name="name" required minLength="2" maxLength="100" autoComplete="name" /></label>
      <label>Email<input name="email" type="email" required maxLength="254" autoComplete="email" /></label>
      <label>Phone (optional)<input name="phone" type="tel" maxLength="30" autoComplete="tel" /></label>
      <label>{admission ? 'Child’s class / enquiry' : 'Subject'}
        <input name="subject" defaultValue={admission ? 'Admission enquiry' : ''} required maxLength="120" />
      </label>
      <label>Message<textarea name="message" required minLength="5" maxLength="3000" rows="5" /></label>
      <label className="honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex="-1" autoComplete="off" /></label>
      <button className="btn" disabled={busy}>{busy ? 'Sending…' : 'Send enquiry'}</button>
      {status && <p role="status">{status}</p>}
    </form>
  )
}
