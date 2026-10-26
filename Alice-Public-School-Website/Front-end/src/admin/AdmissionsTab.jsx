import { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'

const statuses = ['New', 'Contacted', 'Follow-up', 'Converted']

export default function AdmissionsTab() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError('')

    api('/admin/admissions')
      .then(d => setRows(d.rows || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const shownRows = useMemo(
    () =>
      rows.filter(
        r =>
          JSON.stringify(r).toLowerCase().includes(search.toLowerCase()) &&
          (statusFilter === 'All' ||
            (r.status || 'New') === statusFilter)
      ),
    [rows, search, statusFilter]
  )

  const updateStatus = async (id, status) => {
    try {
      setError('')

      await api(`/admin/admissions/${id}/status`, {
        method: 'PATCH',
        body: { status }
      })

      setRows(old =>
        old.map(r =>
          String(r._id) === String(id) ? { ...r, status } : r
        )
      )
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      <div className="adm-page-heading">
        <div>
          <p className="adm-eyebrow">ENQUIRY MANAGEMENT</p>
          <h2>Admission enquiries</h2>
          <p className="adm-muted">
            Admission enquiries are securely managed in the school database.
          </p>
        </div>

        <div className="adm-actions">
          <button
            className="btn small outline"
            onClick={load}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="adm-stats">
        <div>
          <span>Total enquiries</span>
          <strong>{rows.length}</strong>
        </div>
        <div>
          <span>New</span>
          <strong>
            {rows.filter(r => (r.status || 'New') === 'New').length}
          </strong>
        </div>
        <div>
          <span>Follow-up</span>
          <strong>
            {rows.filter(r => r.status === 'Follow-up').length}
          </strong>
        </div>
        <div>
          <span>Converted</span>
          <strong>
            {rows.filter(r => r.status === 'Converted').length}
          </strong>
        </div>
      </div>

      <div className="adm-row">
        <input
          aria-label="Search enquiries"
          placeholder="Search student, parent, phone, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          {statuses.map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading enquiries…</p>
      ) : (
        <div className="adm-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student / Class</th>
                <th>Parent</th>
                <th>Contact</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {shownRows.map(r => (
                <tr key={r._id || r.date + r.email}>
                  <td>
                    {r.date ||
                      (r.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : '—')}
                  </td>

                  <td>
                    <b>{r.studentName}</b>
                    <br />
                    <span className="adm-muted">{r.classApplying}</span>
                  </td>

                  <td>{r.parentName}</td>

                  <td>
                    {r.phone}
                    <br />
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                  </td>

                  <td>{r.message || '—'}</td>

                  <td>
                    <select
                      value={r.status || 'New'}
                      onChange={e => updateStatus(r._id, e.target.value)}
                      aria-label={`Status for ${r.studentName}`}
                    >
                      {statuses.map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}

              {shownRows.length === 0 && (
                <tr>
                  <td colSpan="6">
                    {rows.length
                      ? 'No enquiries match your filters.'
                      : 'No enquiries received yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}