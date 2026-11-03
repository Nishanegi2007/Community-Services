import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import NoticeBoard from '../components/NoticeBoard'
import Gallery from '../components/Gallery'
import StudentLifeCards from '../components/StudentLife'
import { faqs } from '../data'

<<<<<<< HEAD
export default function Home({ isAdmin = false }) {
  return (
    <>
      <Hero isAdmin={isAdmin} />

      <section className="sec wrap">
        <h2>Welcome to Alice Public School</h2>

        <p className="lead">
          Serving families in Molarband Extension,
          Badarpur, with attentive teaching, a safe
          campus, and steady progress for every child.
        </p>

        <div className="grid3">
          <div className="card tile c1">
            <div className="ico">📚</div>
            <h4>Core learning</h4>
            <p>
              Language, mathematics, and environmental
              studies with regular assessment.
            </p>
          </div>

          <div className="card tile c2">
            <div className="ico">⚽</div>
            <h4>Sports &amp; play</h4>
            <p>
              Physical activity and friendly games
              through the year.
            </p>
          </div>

          <div className="card tile c3">
            <div className="ico">🎨</div>
            <h4>Creative activities</h4>
            <p>
              Art, craft, assemblies, and school
              celebrations.
            </p>
          </div>
        </div>
      </section>

      <section className="sec wrap">
        <h2>School gallery</h2>

        <Gallery />

        <p className="center">
          <Link className="btn" to="/gallery">
            View full gallery
          </Link>
        </p>
      </section>

      <section className="sec wrap two">
        <div>
          <h2>School life</h2>

          <p className="lead">
            A general education built on core subjects,
            with room to grow beyond the classroom.
          </p>

          <StudentLifeCards />
        </div>

        <NoticeBoard />
      </section>

      <section className="sec wrap narrow">
        <h2>Frequently asked questions</h2>

        {faqs.map(([question, answer]) => (
          <div
            key={question}
            className="card faq"
          >
            <h3>{question}</h3>
            <p>{answer}</p>
          </div>
        ))}

        {!isAdmin && (
          <p className="center">
            <Link
              className="btn"
              to="/admissions"
            >
              Apply for Admission
            </Link>
          </p>
        )}

      </section>
    </>
  )
}
=======
export default function Home() {
  return <>
    <Hero />
    <section className="sec wrap" id="about">
      <h2>About Alice Public School</h2>
      <p className="lead">Alice Public School serves Nursery through Class V in the Molarband Extension community of Badarpur. We focus on attentive teaching, a safe campus, and steady progress each term.</p>
      <div className="grid3">
        <div className="card tile c1"><div className="ico">📚</div><h4>Core learning</h4><p>Language, mathematics, and environmental studies with regular assessment.</p></div>
        <div className="card tile c2"><div className="ico">⚽</div><h4>Sports &amp; play</h4><p>Physical activity and friendly games through the year.</p></div>
        <div className="card tile c3"><div className="ico">🎨</div><h4>Creative activities</h4><p>Art, craft, assemblies, and school celebrations.</p></div>
      </div>
    </section>
    <section className="sec wrap"><h2>School gallery</h2><Gallery /><p className="center"><Link className="btn" to="/gallery">View full gallery</Link></p></section>
    <section className="sec wrap school-life" id="student-life"><h2>Student life</h2><p className="lead">From core classroom learning to sports, art, craft, assemblies, and celebrations, students have room to grow beyond the textbook.</p><StudentLifeCards /></section>
    <section className="sec wrap notice-section"><NoticeBoard /></section>
    <section className="sec wrap leadership-section">
      <h2>Messages from our school leaders</h2>
      <div className="leadership-grid">
        <article className="card leadership-card">
          <img className="leader-photo" src="/images/principal.jpg" alt="Anju Rajput, Principal of Alice Public School" />
          <div><p className="leader-role">Principal</p><h3>Anju Rajput</h3><p>Every child who walks into Alice Public School arrives curious, and it is our job to keep that curiosity alive. From Nursery through Class V, we focus on reading, numbers, kindness, and confidence so each student is ready for what comes next. Parents are always welcome to visit and see our classrooms.</p></div>
        </article>
        <article className="card leadership-card">
          <img className="leader-photo" src="/vice-principal-avatar.svg" alt="Illustrated avatar for the Vice Principal" />
          <div><p className="leader-role">Vice Principal</p><h3>Vice Principal</h3><p>Every child can grow with encouragement, patient guidance, and a caring school community. We want students to stay curious, build confidence, and enjoy learning each day. We look forward to working with families to support every child.</p></div>
        </article>
      </div>
    </section>
    <section className="sec wrap narrow"><h2>Frequently asked questions</h2>{faqs.map(([question, answer]) => <div key={question} className="card faq"><h3>{question}</h3><p>{answer}</p></div>)}<p className="center"><Link className="btn" to="/admissions">Apply for Admission</Link></p></section>
  </>
}
>>>>>>> acd5c80 (Adding admin feature)
