import { Link } from 'react-router-dom'

export default function Footer() {
  return <footer className="footer"><div className="wrap footer-grid"><div><h2>Alice Public School</h2><p>Learning, growing, and exploring together.</p><Link to="/admin">Admin</Link></div><div><h3>Visit us</h3><address className="footer-address">155E, Khajoor Rd, Block C<br />Molarband Extension, Badarpur<br />New Delhi, Delhi 110044</address><a className="footer-directions" href="https://www.google.com/maps/search/?api=1&query=Alice+Public+School+155E+Khajoor+Rd+Block+C+Molarband+Extension+Badarpur+New+Delhi+110044" target="_blank" rel="noreferrer">Get directions</a></div></div><p className="copy">© {new Date().getFullYear()} Alice Public School</p></footer>
}
