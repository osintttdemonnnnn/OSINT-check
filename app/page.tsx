"use client";
import {useState} from 'react';
import styles from './dashboard.module.css';
const tools = ['Email','IP address','Domain / DNS','Discord ID'];
export default function Dashboard(){
 const [tool,setTool]=useState('Email'); const [value,setValue]=useState(''); const [open,setOpen]=useState(false); const [busy,setBusy]=useState(false); const [result,setResult]=useState<unknown>(null); const [error,setError]=useState('');
 async function check(event: React.FormEvent<HTMLFormElement>){
  event.preventDefault(); setBusy(true); setError(''); setResult(null);
  try {
   if(tool==='Discord ID'){
    if(!/^[0-9]{17,20}$/.test(value.trim())) throw new Error('Enter a 17–20 digit Discord snowflake ID.');
    const id=BigInt(value.trim()); if(id>((BigInt(1)<<BigInt(64))-BigInt(1))) throw new Error('ID exceeds the 64-bit snowflake range.');
    const timestamp=Number((id>>BigInt(22))+BigInt('1420070400000'));
    setResult({id:value.trim(),createdAt:new Date(timestamp).toISOString(),note:'Decodes the timestamp only. Does not verify that an account exists or retrieve profile data.'});
   } else {
    const response=await fetch('/api/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tool,value}),signal:AbortSignal.timeout(15000)});
    const data=await response.json(); if(!response.ok) throw new Error(data.error || 'Check failed.'); setResult(data);
   }
  } catch(e){setError(e instanceof Error ? e.message : 'Check failed.');} finally{setBusy(false);}
 }
 return <div className={styles.shell}><aside className={`${styles.sidebar} ${open?styles.expanded:''}`}><div className={styles.brand}>OSINT / CHECK</div><button className={styles.menu} onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="tool-navigation">{open?'Close menu':'Choose tool ☰'}</button><nav id="tool-navigation" className={styles.navigation} aria-label="Tools">{tools.map(name=><button key={name} disabled={busy} aria-pressed={tool===name} onClick={()=>{setTool(name);setValue('');setResult(null);setError('');setOpen(false);}}>{name}</button>)}</nav></aside><main className={styles.main}><p className={styles.eyebrow}>IN-APP RESEARCH UTILITIES</p><h1>Check it here.</h1><p>Results appear on this page. No external search redirects.</p><section className={styles.card}><h2>{tool}</h2><p>{tool==='Email'?'Check basic email syntax and the domain’s live DNS records. This does not verify the mailbox or check breaches.':tool==='IP address'?'Validate IPv4 / IPv6 addresses and retrieve reverse DNS names when available.':tool==='Domain / DNS'?'Retrieve live A, AAAA, MX, TXT, and NS records.':'Decode the creation timestamp embedded in a Discord snowflake.'}</p><form onSubmit={check}><label htmlFor="lookup-value">{tool}</label><input id="lookup-value" value={value} onChange={e=>setValue(e.target.value)} required maxLength={254} disabled={busy} type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder={tool==='Email'?'name@example.com':tool==='IP address'?'8.8.8.8':tool==='Domain / DNS'?'example.com':'Discord snowflake ID'}/><button type="submit" disabled={busy}>{busy?'Checking…':'Run check'}</button></form><div aria-live="polite" aria-busy={busy}>{error&&<p role="alert" className={styles.error}>{error}</p>}{result!==null&&<section className={styles.results}><h3>Results</h3><pre>{JSON.stringify(result,null,2)}</pre></section>}</div></section><p className={styles.privacy}>Use only for authorized research. Checks run on the server and domain/IP queries go to DNS infrastructure. Discord timestamps decode locally. This interface does not save query history. Hosting infrastructure may retain operational logs.</p></main></div>;
}
