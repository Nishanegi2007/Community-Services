import PrincipalCard from '../components/Principal'

export default function About() {
  return <section className="sec wrap"><h1>About our school</h1>
    <p className="lead">Alice Public School serves Nursery through Class V in the Molarband Extension community of Badarpur. We focus on attentive teaching, a safe campus, and steady progress each term.</p>
    <div className="grid3"><div className="card tile c1"><div className="ico">📖</div><h4>Core learning</h4><p>Reading, language, mathematics, and environmental studies.</p></div><div className="card tile c2"><div className="ico">🤝</div><h4>Care and confidence</h4><p>Kindness, confidence, and personal attention for every child.</p></div><div className="card tile c3"><div className="ico">🎨</div><h4>Learning beyond books</h4><p>Sports, play, art, craft, assemblies, and celebrations.</p></div></div>
    <h2>Why choose us?</h2><ul className="ticks"><li>Attentive teaching and personal attention</li><li>A safe place for children to learn</li><li>Balanced focus on core subjects, sports, and creative activities</li><li>Parents hear from the school directly</li></ul>
    <h2>Principal's message</h2><PrincipalCard />
  </section>
}
