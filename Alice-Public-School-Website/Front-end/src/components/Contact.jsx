import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { api } from '../api.js'

const classes = ['Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
const emptyForm = { studentName: '', parentName: '', phone: '', email: '', classApplying: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(emptyForm) // what the parent has typed
  const [status, setStatus] = useState('') // message shown under the button
  const [isError, setIsError] = useState(false)

  // Runs on every key press: updates the field that changed
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.studentName || !form.parentName || !form.phone || !form.email || !form.classApplying) {
      setIsError(true)
      return setStatus('Please fill all fields marked with *')
    }

    try {
      // Step 1: send the data to our Express server, which saves it in the Google Sheet
      await api('/admissions', { method: 'POST', body: form })

      // Step 2: EmailJS sends an email alert to the school office
      if (import.meta.env.VITE_EMAILJS_SERVICE_ID && import.meta.env.VITE_EMAILJS_TEMPLATE_ID && import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
        await emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_TEMPLATE_ID, {
          from_name: form.parentName, reply_to: form.email,
          message: `Student: ${form.studentName}\nClass: ${form.classApplying}\nPhone: ${form.phone}\n${form.message}`,
        }, { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }).catch(() => {})
      }

      setIsError(false)
      setStatus('Thank you! Your enquiry was received. The school will contact you soon.')
      setForm(emptyForm) // clear the form
    } catch (error) {
      setIsError(true)
      setStatus(error.message)
    }
  }

  return (
    <section id="contact"><div className="wrap contact">
      <div>
        <h2>Contact Us</h2>
        <p>Fill in the admission enquiry form and our office will get back to you.</p>
        <p><b>Address:</b> Alice Public School, School Road, Your City</p>
        <p><b>Phone:</b> +91 00000 00000</p>
        <p><b>Email:</b> office@alicepublicschool.example</p>
        <p><b>Office hours:</b> Mon to Sat, 8:00 am to 2:00 pm</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label>Student's name *<input name="studentName" value={form.studentName} onChange={handleChange} /></label>
        <label>Parent's name *<input name="parentName" value={form.parentName} onChange={handleChange} /></label>
        <label>Phone *<input name="phone" type="tel" value={form.phone} onChange={handleChange} /></label>
        <label>Email *<input name="email" type="email" value={form.email} onChange={handleChange} /></label>
        <label>Class applying for *
          <select name="classApplying" value={form.classApplying} onChange={handleChange}>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Message (optional)<textarea name="message" rows="3" value={form.message} onChange={handleChange} /></label>
        <button className="btn" type="submit">Send enquiry</button>
        <div id="status" style={{ color: isError ? '#c0392b' : 'var(--green)' }}>{status}</div>
      </form>
    </div></section>
  )
}
