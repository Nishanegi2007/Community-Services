import Announcements from './components/Announcements.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import { About, Principal, Academics, Facilities, Gallery, Admissions } from './components/Sections.jsx'
import Contact from './components/Contact.jsx'

export default function App() {
  return (
    <>
      <Announcements />
      <Header />
      <main id="top">
        <Hero />
        <About />
        <Principal />
        <Academics />
        <Facilities />
        <Gallery />
        <Admissions />
        <Contact />
      </main>
      <footer><div className="wrap">&copy; {new Date().getFullYear()} Alice Public School. All rights reserved.</div></footer>
    </>
  )
}
