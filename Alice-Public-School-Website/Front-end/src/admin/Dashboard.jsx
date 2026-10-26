import { useState } from 'react'
import AdmissionsTab from './AdmissionsTab.jsx'
import EventsTab from './EventsTab.jsx'
import AnnouncementsTab from './AnnouncementsTab.jsx'
import GalleryTab from './GalleryTab.jsx'
const tabs=[['admissions','Admissions'],['events','Events'],['announcements','News & updates'],['gallery','Gallery']]
export default function Dashboard({onLogout}){const[tab,setTab]=useState('admissions');return <><header className="adm-top"><div className="adm-brand"><span className="adm-brand-mark">A</span><div><b>Alice Public School</b><small>Administration portal</small></div></div><div className="tabs">{tabs.map(([id,label])=><button key={id} className="tab" aria-selected={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</div><button className="btn small outline" onClick={onLogout}>Log out</button></header><main className="adm-main">{tab==='admissions'&&<AdmissionsTab/>}{tab==='events'&&<EventsTab/>}{tab==='announcements'&&<AnnouncementsTab/>}{tab==='gallery'&&<GalleryTab/>}</main></>}
