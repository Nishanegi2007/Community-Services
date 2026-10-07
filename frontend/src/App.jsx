import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Admissions from './pages/Admissions'
import Principal from './pages/Principal'
import Contact from './pages/Contact'
import StudentLife from './pages/StudentLife'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}
function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const f = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f)
  }, [])
  return show ? <button className="totop" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button> : null
}
export default function App() {
  return (<>
    <ScrollTop /><Navbar />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/principal" element={<Principal />} />
        <Route path="/student-life" element={<StudentLife />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer /><BackToTop />
  </>)
}
