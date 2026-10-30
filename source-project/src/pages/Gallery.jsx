import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
const names=[['winner.png','Trophy Awarding Ceremony','Awards'],['gallery4.jpg','Newspaper and Press Coverage','Press'],['gallery7.jpg','Medal Winners and Finalists','Awards'],['jersey.jpg','Official Tournament Jersey','Behind the Scenes'],['awards.jpg','Trophies and Accolades','Awards'],['gallery2.jpg','Match Day Action','Matches'],['gallery3.jpg','Powerplay Batting','Matches'],['gallery6.jpg','Bowling in Full Throttle','Matches'],['gallery8.jpg','The Battle Arena','Matches'],['umpire.jpg','Match Officials and Fair Play','Behind the Scenes'],['streaming.jpg','Live Coverage and Broadcast','Press'],['gallery5.jpg','Team Strategy Timeout','Matches'],['memorable.jpg','Unforgettable Moments','Awards'],['refreshments.jpg','Hospitality and Refreshments','Behind the Scenes']];
export default function GalleryPage(){
 const base=import.meta.env.BASE_URL+'images/'; const api=import.meta.env.VITE_API_URL||'http://localhost:5001/api';
 const [uploaded,setUploaded]=useState([]);const [active,setActive]=useState('All');const [selected,setSelected]=useState(null);
 useEffect(()=>{fetch(api+'/gallery').then(r=>r.ok?r.json():[]).then(setUploaded).catch(()=>setUploaded([]))},[api]);
 const items=[...names.map((x,i)=>({id:'static-'+i,src:base+x[0],title:x[1],category:x[2],caption:x[1]})),...uploaded.map(x=>({id:'uploaded-'+x.id,src:x.url,title:x.caption||'Winter Bash League',category:'Community',caption:x.caption||'Winter Bash League'}))];
 const categories=['Matches','Awards','Press'];
 const visible=items.filter(x=>active==='All'||x.category===active);
 return <Layout><main className="page content-page gallery-page">
 <div className="gallery-page-heading">
   <div className="gallery-page-eyebrow">MOMENTS AND MEMORIES</div>
   <div className="gallery-filters">
     {categories.map(c=><button className="gallery-filter" key={c} onClick={()=>setActive(current=>current===c?'All':c)} aria-pressed={active===c} style={{border:active===c?'1px solid var(--lime)':'1px solid rgba(255,255,255,.12)',background:active===c?'var(--lime)':'rgba(255,255,255,.04)',color:active===c?'#06111d':'#cbd5e1'}}>{c}</button>)}
   </div>
 </div>
 <div className="gallery-page-grid">{visible.map((item,i)=><motion.button className="gallery-page-card" key={item.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.2,delay:Math.min(i*.01,.08)}} onClick={()=>setSelected(item)}><img src={item.src} alt={item.title} loading="lazy" decoding="async" fetchPriority="low" onError={e=>{e.currentTarget.style.display='none'}}/><span className="gallery-page-card-caption"><small>{item.category}</small><strong>{item.title}</strong></span></motion.button>)}</div>
 <AnimatePresence>{selected&&<motion.div className="gallery-lightbox" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelected(null)}><div className="gallery-lightbox-content" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label={selected.title}><div className="gallery-lightbox-media"><img src={selected.src} alt={selected.title} decoding="async" fetchPriority="high"/><button className="gallery-lightbox-close" onClick={()=>setSelected(null)}>Close</button></div><div className="gallery-lightbox-copy"><small>{selected.category}</small><h2>{selected.title}</h2><p>{selected.caption}</p></div></div></motion.div>}</AnimatePresence>
 </main></Layout>
}
