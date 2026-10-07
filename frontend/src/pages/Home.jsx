import Principal from '../components/Principal'
export default function About() {
  return (<section className="sec wrap"><h1>About our school</h1>
    <p className="lead">Bright Future School is a happy, safe school for Classes 1 to 5, built on kindness, curiosity and good habits.</p>
    <div className="grid3"><div className="card tile c1"><div className="ico">🎯</div><h4>Our Vision</h4><p>Confident, caring children ready for tomorrow.</p></div><div className="card tile c2"><div className="ico">🚀</div><h4>Our Mission</h4><p>Joyful learning through activity, play and love.</p></div><div className="card tile c3"><div className="ico">🏛️</div><h4>Our History</h4><p>Started in 2005 with 40 students. Now 500+ and growing.</p></div></div>
    <h2>Why choose us?</h2><ul className="ticks"><li>Small classes with personal attention</li><li>Safe campus with CCTV and trained staff</li><li>Balanced focus on studies, sports and arts</li><li>Regular parent-teacher communication</li></ul>
    <h2>Principal's message</h2><Principal /></section>)
}
