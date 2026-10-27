import type {ReactNode} from 'react';

export function Brand({label='CEX'}:{label?:string}) {
  return <span aria-label={`${label} 홈`} style={{display:'inline-flex',alignItems:'center',gap:10,fontWeight:800,letterSpacing:'-0.03em'}}>
    <span aria-hidden="true" style={{display:'grid',placeItems:'center',width:30,height:30,borderRadius:8,background:'#f0b90b',color:'#111827'}}>C</span>
    {label}
  </span>;
}

export function Section({title,description,children}:{title:string;description?:string;children:ReactNode}) {
  return <section style={{background:'#161a1e',border:'1px solid #2b3139',borderRadius:8,padding:20}}>
    <header style={{marginBottom:16}}><h2 style={{fontSize:16,fontWeight:700,margin:0}}>{title}</h2>{description&&<p style={{color:'#929aa5',fontSize:13,margin:'6px 0 0'}}>{description}</p>}</header>
    {children}
  </section>;
}

export function StateBadge({children,tone='neutral'}:{children:ReactNode;tone?:'neutral'|'good'|'warn'|'bad'}) {
  const colors={neutral:['#2b3139','#d1d5db'],good:['#173c2c','#32d583'],warn:['#493b15','#f0b90b'],bad:['#48232a','#f6465d']}[tone];
  return <span style={{display:'inline-flex',padding:'3px 8px',borderRadius:999,background:colors[0],color:colors[1],fontSize:12,fontWeight:700}}>{children}</span>;
}
