import { useCallback, useEffect, useMemo, useState } from 'react'
import readXlsxFile from 'read-excel-file/browser'
import { api } from '../lib/api'

const feeTabs = ['Ledger', 'Students', 'Fee rates']
const defaultRates = { nursery: '600', lkgTo4: '700', class5: '800' }
const classOptions = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5']

function academicYearFor(date = new Date()) {
  const startYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`
}

function startMonthForYear(year) {
  return `${year.slice(0, 4)}-04`
}

function monthForYear(year) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return currentMonth >= startMonthForYear(year) && currentMonth <= `${Number(year.slice(0, 4)) + 1}-03`
    ? currentMonth
    : startMonthForYear(year)
}

function normalizeClass(value) {
  const text = String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (['nur', 'nursery', 'pre nursery', 'pre-nursery'].includes(text)) return 'Nursery'
  if (['lkg', 'lower kg', 'lower kindergarten'].includes(text)) return 'LKG'
  if (['ukg', 'upper kg', 'upper kindergarten'].includes(text)) return 'UKG'
  const numberWords = { '1st': 1, first: 1, '2nd': 2, second: 2, '3rd': 3, third: 3, '4th': 4, fourth: 4, '5th': 5, fifth: 5 }
  const match = text.match(/^(?:class\s*)?(\d|1st|first|2nd|second|3rd|third|4th|fourth|5th|fifth)$/)
  const number = match ? Number(match[1]) || numberWords[match[1]] : 0
  return number >= 1 && number <= 5 ? `Class ${number}` : ''
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"' && quoted && text[index + 1] === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(cell)
      if (row.some((value) => String(value).trim())) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }
  row.push(cell)
  if (row.some((value) => String(value).trim())) rows.push(row)
  return rows
}

const headerAliases = {
  admissionnumber: 'admissionNumber', admissionno: 'admissionNumber', admissionid: 'admissionNumber', rollnumber: 'admissionNumber', rollno: 'admissionNumber', studentid: 'admissionNumber',
  name: 'name', studentname: 'name', fullname: 'name',
  class: 'classLevel', classlevel: 'classLevel', grade: 'classLevel',
  guardianname: 'guardianName', parentname: 'guardianName', fathername: 'guardianName',
  guardianphone: 'guardianPhone', parentguardianphone: 'guardianPhone', phone: 'guardianPhone', mobile: 'guardianPhone', 'mobilenumber': 'guardianPhone', contactnumber: 'guardianPhone',
  joinedat: 'joinedAt', joiningdate: 'joinedAt', admissiondate: 'joinedAt',
}

function parseStudentRows(rawRows) {
  if (!rawRows?.length) throw new Error('The spreadsheet is empty.')
  const headers = rawRows[0].map((value) => String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
  const columnMap = headers.map((header) => headerAliases[header] || '')
  const positions = Object.fromEntries(columnMap.map((name, index) => [name, index]))
  const required = ['admissionNumber', 'name', 'classLevel', 'guardianPhone']
  const missing = required.filter((name) => positions[name] === undefined)
  if (missing.length) throw new Error(`Missing required columns: ${missing.join(', ')}. Download the template to see the expected headers.`)

  const seen = new Set()
  return rawRows.slice(1).flatMap((cells, index) => {
    const value = (key) => positions[key] === undefined ? '' : (cells[positions[key]] ?? '')
    const dateCell = value('joinedAt')
    const joinedAt = dateCell instanceof Date && !Number.isNaN(dateCell.getTime())
      ? `${dateCell.getFullYear()}-${String(dateCell.getMonth() + 1).padStart(2, '0')}-${String(dateCell.getDate()).padStart(2, '0')}`
      : String(dateCell).trim()
    const record = {
      admissionNumber: String(value('admissionNumber')).trim().toUpperCase(),
      name: String(value('name')).trim(),
      classLevel: normalizeClass(value('classLevel')),
      guardianName: String(value('guardianName')).trim(),
      guardianPhone: String(value('guardianPhone')).trim(),
      joinedAt,
      rowNumber: index + 2,
      errors: [],
    }
    if (!record.admissionNumber) record.errors.push('Admission number is required.')
    if (!record.name) record.errors.push('Student name is required.')
    if (!record.classLevel) record.errors.push('Class is invalid.')
    if (!record.guardianPhone) record.errors.push('Guardian phone is required.')
    if (record.admissionNumber && seen.has(record.admissionNumber)) record.errors.push('Admission number is duplicated in this file.')
    if (record.admissionNumber) seen.add(record.admissionNumber)
    return [record]
  })
}

function downloadStudentTemplate() {
  const content = '\uFEFFadmissionNumber,name,classLevel,guardianName,guardianPhone\r\nAPS-001,Student Name,Class 1,Parent Name,9876543210\r\n'
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'alice-school-student-template.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function money(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function humanMonth(month) {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function FeesDashboard() {
  const currentYear = useMemo(() => academicYearFor(), [])
  const [section, setSection] = useState('Ledger')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [rates, setRates] = useState([])
  const [rateYear, setRateYear] = useState(currentYear)
  const [rateValues, setRateValues] = useState(defaultRates)
  const [feeYear, setFeeYear] = useState(currentYear)
  const [ledgerMonth, setLedgerMonth] = useState(() => monthForYear(currentYear))
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [ledger, setLedger] = useState([])
  const [ledgerBusy, setLedgerBusy] = useState(true)
  const [students, setStudents] = useState([])
  const [studentSearch, setStudentSearch] = useState('')
  const [studentBusy, setStudentBusy] = useState(true)
  const [studentFile, setStudentFile] = useState(null)
  const [importPreview, setImportPreview] = useState([])
  const [importSummary, setImportSummary] = useState(null)

  const rateYears = useMemo(() => [...new Set([feeYear, currentYear, ...rates.map(({ academicYear }) => academicYear)])].sort().reverse(), [feeYear, currentYear, rates])
  const currentRate = rates.find(({ academicYear }) => academicYear === feeYear)

  const loadRates = useCallback(async () => {
    const data = await api('/fees/rates')
    setRates(data.rates)
    const plan = data.rates.find(({ academicYear }) => academicYear === rateYear)
    const defaults = plan?.monthlyRates || data.rates[0]?.monthlyRates || defaultRates
    setRateValues({ nursery: String(defaults.nursery), lkgTo4: String(defaults.lkgTo4), class5: String(defaults.class5) })
  }, [rateYear])

  const loadStudents = useCallback(async () => {
    setStudentBusy(true)
    try {
      const query = new URLSearchParams({ academicYear: feeYear, search: studentSearch })
      const data = await api(`/fees/students?${query}`)
      setStudents(data.students)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setStudentBusy(false)
    }
  }, [feeYear, studentSearch])

  const loadLedger = useCallback(async () => {
    setLedgerBusy(true)
    try {
      const query = new URLSearchParams({ academicYear: feeYear, month: ledgerMonth, search: ledgerSearch })
      const data = await api(`/fees/ledger?${query}`)
      setLedger(data.ledger)
    } catch (error) {
      setLedger([])
      setNotice(error.message)
    } finally {
      setLedgerBusy(false)
    }
  }, [feeYear, ledgerMonth, ledgerSearch])

  useEffect(() => {
    let active = true
    api('/fees/rates')
      .then((data) => {
        if (!active) return
        setRates(data.rates)
        const plan = data.rates.find(({ academicYear }) => academicYear === currentYear)
        const defaults = plan?.monthlyRates || data.rates[0]?.monthlyRates || defaultRates
        setRateValues({ nursery: String(defaults.nursery), lkgTo4: String(defaults.lkgTo4), class5: String(defaults.class5) })
      })
      .catch((error) => { if (active) setNotice(error.message) })
    return () => { active = false }
  }, [currentYear])

  useEffect(() => {
    if (section !== 'Students') return undefined
    let active = true
    const query = new URLSearchParams({ academicYear: feeYear, search: studentSearch })
    api(`/fees/students?${query}`)
      .then((data) => { if (active) setStudents(data.students) })
      .catch((error) => { if (active) setNotice(error.message) })
      .finally(() => { if (active) setStudentBusy(false) })
    return () => { active = false }
  }, [section, feeYear, studentSearch])

  useEffect(() => {
    if (section !== 'Ledger') return undefined
    let active = true
    const query = new URLSearchParams({ academicYear: feeYear, month: ledgerMonth, search: ledgerSearch })
    api(`/fees/ledger?${query}`)
      .then((data) => { if (active) setLedger(data.ledger) })
      .catch((error) => { if (active) { setLedger([]); setNotice(error.message) } })
      .finally(() => { if (active) setLedgerBusy(false) })
    return () => { active = false }
  }, [section, feeYear, ledgerMonth, ledgerSearch])

  function selectYear(year) {
    setFeeYear(year)
    setLedgerMonth(monthForYear(year))
  }

  function selectRateYear(year) {
    setRateYear(year)
    const plan = rates.find(({ academicYear }) => academicYear === year)
    const defaults = plan?.monthlyRates || rates[0]?.monthlyRates || defaultRates
    setRateValues({ nursery: String(defaults.nursery), lkgTo4: String(defaults.lkgTo4), class5: String(defaults.class5) })
  }

  async function saveRatePlan(event) {
    event.preventDefault()
    setBusy(true)
    setNotice('')
    try {
      await api(`/fees/rates/${encodeURIComponent(rateYear)}`, {
        method: 'PUT',
        body: JSON.stringify({ nursery: Number(rateValues.nursery), lkgTo4: Number(rateValues.lkgTo4), class5: Number(rateValues.class5) }),
      })
      await loadRates()
      setNotice(`Monthly fee rates saved for ${rateYear}. Existing student enrollments keep their recorded rate.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function addStudent(event) {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    // Academic year is selected in this form outside its named inputs.
    // Include it explicitly because the API uses it to create the enrollment.
    values.academicYear = feeYear
    values.admissionNumber = values.admissionNumber.trim().toUpperCase()
    setBusy(true)
    setNotice('')
    try {
      await api('/fees/students', { method: 'POST', body: JSON.stringify(values) })
      form.reset()
      await loadStudents()
      setNotice(`${values.name} was added and enrolled for ${feeYear}.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function chooseStudentFile(event) {
    const file = event.target.files?.[0]
    setStudentFile(file || null)
    setImportPreview([])
    setImportSummary(null)
    setNotice('')
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setNotice('Spreadsheet must be 5 MB or smaller.')
      return
    }
    try {
      const isCsv = file.name.toLowerCase().endsWith('.csv')
      const rawRows = isCsv ? parseCsv(await file.text()) : await readXlsxFile(file)
      setImportPreview(parseStudentRows(rawRows))
    } catch (error) {
      setNotice(error.message || 'Could not read this spreadsheet. Use an .xlsx or .csv file.')
    }
  }

  async function importStudents() {
    const validRows = importPreview.filter(({ errors }) => errors.length === 0).map((row) => {
      const copy = { ...row }
      delete copy.errors
      return copy
    })
    if (!validRows.length) {
      setNotice('Fix the spreadsheet errors before importing students.')
      return
    }
    setBusy(true)
    setNotice('')
    try {
      const result = await api('/fees/students/import', {
        method: 'POST',
        body: JSON.stringify({ academicYear: feeYear, rows: validRows }),
      })
      setImportSummary({ ...result.summary, invalidRows: importPreview.length - validRows.length, results: result.results })
      setNotice('Spreadsheet import finished. Review the row results below before importing another file.')
      await Promise.all([loadStudents(), loadRates()])
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function changeMonthlyFeeStatus(row, status) {
    setBusy(true)
    try {
      const result = await api('/fees/ledger/status', {
        method: 'PATCH',
        body: JSON.stringify({ enrollmentId: row.enrollmentId, academicYear: feeYear, month: ledgerMonth, status }),
      })
      await loadLedger()
      setNotice(result.message)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fees-dashboard">
      <div className="admin-tabs fees-tabs" role="tablist" aria-label="Fee management sections">
        {feeTabs.map((name) => <button key={name} className={section === name ? 'chip on' : 'chip'} onClick={() => { setSection(name); setNotice(''); if (name === 'Students') setStudentBusy(true); if (name === 'Ledger') setLedgerBusy(true) }}>{name}</button>)}
      </div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      {section === 'Ledger' && <section className="admin-section">
        <div className="fees-toolbar card">
          <label>Academic year<select value={feeYear} onChange={(event) => selectYear(event.target.value)}>{rateYears.map((year) => <option key={year}>{year}</option>)}</select></label>
          <label>Fee month<input type="month" value={ledgerMonth} onChange={(event) => setLedgerMonth(event.target.value)} /></label>
          <label>Search student<input value={ledgerSearch} onChange={(event) => setLedgerSearch(event.target.value)} placeholder="Name or admission number" /></label>
        </div>
        {!currentRate && <p className="admin-notice">No fee rates are set for {feeYear}. Add them in Fee rates before enrolling students.</p>}
        {ledgerBusy ? <p>Loading fee ledger…</p> : <div className="fees-table-wrap"><table className="fees-table">
          <thead><tr><th>Student</th><th>Class</th><th>Due</th><th>Paid</th><th>Balance</th><th>Payment status</th></tr></thead>
          <tbody>
            {ledger.length === 0 && <tr><td colSpan="6">No enrolled students are due for {humanMonth(ledgerMonth)}.</td></tr>}
            {ledger.map((row) => <tr key={`${row.enrollmentId}-${ledgerMonth}`}>
              <td><strong>{row.student.name}</strong><small>{row.student.admissionNumber} · {row.student.guardianPhone}</small></td>
              <td>{row.classLevel}</td><td>{money(row.monthlyFee)}</td><td>{money(row.amountPaid)}</td><td>{money(row.balance)}</td>
              <td><select aria-label={`Payment status for ${row.student.name}, ${humanMonth(ledgerMonth)}`} value={row.status} disabled={busy} onChange={(event) => changeMonthlyFeeStatus(row, event.target.value)}><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select></td>
            </tr>)}
          </tbody>
        </table></div>}
      </section>}

      {section === 'Students' && <section className="admin-section">
        <div className="fees-management-grid">
          <form className="card form" onSubmit={addStudent}>
            <h3>Add student</h3>
            <label>Academic year<select value={feeYear} onChange={(event) => selectYear(event.target.value)}>{rateYears.map((year) => <option key={year}>{year}</option>)}</select></label>
            <label>Search existing students<input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Name, admission number, phone" /></label>
            {!currentRate && <div className="admin-notice fee-rate-required" role="status">
              <p>Set the monthly fee rates for {feeYear} before enrolling students. Defaults are Nursery ₹600, LKG–Class 4 ₹700, and Class 5 ₹800; you can change them before saving.</p>
              <button className="chip on" type="button" onClick={() => { selectRateYear(feeYear); setSection('Fee rates') }}>Set rates for {feeYear}</button>
            </div>}
            <label>Admission number<input name="admissionNumber" required maxLength="40" /></label>
            <label>Student name<input name="name" required maxLength="100" /></label>
            <label>Class<select name="classLevel" required>{classOptions.map((level) => <option key={level}>{level}</option>)}</select></label>
            <label>Guardian name<input name="guardianName" maxLength="100" /></label>
            <label>Guardian phone<input name="guardianPhone" required type="tel" maxLength="30" /></label>
            <button className="btn" disabled={busy || !currentRate}>{busy ? 'Saving…' : `Add and enroll for ${feeYear}`}</button>
          </form>

          <div className="card form student-import">
            <h3>Import student spreadsheet</h3>
            <p>Upload an Excel .xlsx file or a .csv file. Admission number, name, class, and guardian phone are required. If no joining date is available, the student starts from this month.</p>
            <button className="chip" type="button" onClick={downloadStudentTemplate}>Download CSV template</button>
            <label>Roster file<input type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={chooseStudentFile} /></label>
            {studentFile && <p>{studentFile.name} · {importPreview.length} student rows</p>}
            {importPreview.length > 0 && <>
              <p>{importPreview.length} students found · {importPreview.filter(({ errors }) => errors.length === 0).length} ready · {importPreview.filter(({ errors }) => errors.length > 0).length} with issues</p>
              {importPreview.some(({ errors }) => errors.length > 0) && <ul className="student-import-errors">{importPreview.filter(({ errors }) => errors.length > 0).slice(0, 8).map((row) => <li key={row.rowNumber}>CSV row {row.rowNumber}: {row.errors.join(' ')}</li>)}</ul>}
              <button className="btn" type="button" disabled={busy || !importPreview.some(({ errors }) => errors.length === 0)} onClick={importStudents}>{busy ? 'Importing…' : `Import into ${feeYear}`}</button>
            </>}
            {importSummary && <div className="fee-import-summary"><strong>Import result</strong><p>Added {importSummary.added} · Enrolled {importSummary.enrolled} · Updated {importSummary.updated} · Errors {importSummary.errors + importSummary.invalidRows}</p>
              {importSummary.results.some(({ outcome }) => outcome === 'error') && <ul>{importSummary.results.filter(({ outcome }) => outcome === 'error').map((result) => <li key={`${result.row}-${result.admissionNumber}`}>Row {result.row} · {result.admissionNumber}: {result.message}</li>)}</ul>}
            </div>}
          </div>
        </div>

        <div className="fees-table-wrap"><table className="fees-table">
          <thead><tr><th>Student</th><th>Class in {feeYear}</th><th>Guardian contact</th></tr></thead>
          <tbody>
            {studentBusy && <tr><td colSpan="3">Loading students…</td></tr>}
            {!studentBusy && students.length === 0 && <tr><td colSpan="3">No students found. Add one or import a roster.</td></tr>}
            {!studentBusy && students.map((student) => <tr key={student._id}>
              <td><strong>{student.name}</strong><small>{student.admissionNumber}</small></td>
              <td>{student.enrollment ? `${student.enrollment.classLevel} · ${money(student.enrollment.monthlyFee)}/month` : 'Not enrolled'}</td>
              <td>{student.guardianName && <>{student.guardianName}<br /></>}<a href={`tel:${student.guardianPhone}`}>{student.guardianPhone}</a></td>
            </tr>)}
          </tbody>
        </table></div>
        <p className="admin-meta">Importing an existing admission number updates that student’s details and adds the selected year’s enrollment. Payments prevent changing that year’s class.</p>
      </section>}

      {section === 'Fee rates' && <section className="admin-section">
        <form className="card form fee-rates-form" onSubmit={saveRatePlan}>
          <h3>Monthly rates by academic year</h3>
          <p>Rates are copied into each enrollment. A new year’s rate changes do not rewrite old payments.</p>
          <label>Academic year (for example 2026-27)<input value={rateYear} onChange={(event) => selectRateYear(event.target.value)} pattern="\d{4}-\d{2}" placeholder="2026-27" required /></label>
          <label>Nursery<input type="number" min="0" max="100000" step="1" value={rateValues.nursery} onChange={(event) => setRateValues((current) => ({ ...current, nursery: event.target.value }))} required /></label>
          <label>LKG through Class 4<input type="number" min="0" max="100000" step="1" value={rateValues.lkgTo4} onChange={(event) => setRateValues((current) => ({ ...current, lkgTo4: event.target.value }))} required /></label>
          <label>Class 5<input type="number" min="0" max="100000" step="1" value={rateValues.class5} onChange={(event) => setRateValues((current) => ({ ...current, class5: event.target.value }))} required /></label>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : rates.some(({ academicYear }) => academicYear === rateYear) ? 'Save rates' : 'Create rate set'}</button>
          <p className="admin-meta">The current academic year starts with Nursery ₹600, LKG–Class 4 ₹700, and Class 5 ₹800. You can update rates later; existing enrollments keep their recorded monthly fee.</p>
        </form>
        <div className="fees-rate-list">
          {rates.length === 0 && <p>No academic-year rates saved yet.</p>}
          {rates.map(({ _id, academicYear, monthlyRates }) => <article className="card fee-rate-card" key={_id}>
            <h4>{academicYear}</h4><p>Nursery {money(monthlyRates.nursery)} · LKG–Class 4 {money(monthlyRates.lkgTo4)} · Class 5 {money(monthlyRates.class5)} per month</p>
            <button className="chip" onClick={() => selectRateYear(academicYear)}>Edit / view</button>
          </article>)}
        </div>
      </section>}
    </div>
  )
}
