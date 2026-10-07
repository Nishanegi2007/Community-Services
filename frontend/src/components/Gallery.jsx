export default function Principal({ full }) {
  return (
    <div className="card prin">
      <img src="https://picsum.photos/seed/principal/300/300" alt="Principal Mrs. Kavita Rao" />
      <div><h3>Mrs. Kavita Rao</h3><small>Principal, M.Ed. · 20 years of teaching</small>
        <p>"Every child is a star waiting to shine. Our job is to give them the sky."</p>
        {full && <><p>Mrs. Rao began as a primary teacher and has led Bright Future School since 2012. She believes in learning through play, kindness and curiosity.</p><p>Dear parents and students, welcome! Together we will build confident, caring and creative young minds.</p></>}
      </div>
    </div>
  )
}
