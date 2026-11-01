"use client";
import { useState } from 'react';
export default function Tools() {
 const [domain,setDomain]=useState('');
 const [id,setId]=useState('');
 const [result,setResult]=useState<unknown>(null);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [recordType,setRecordType]=useState('A');
 async function dns(e: React.FormEvent) {
  e.preventDefault(); setError(''); setResult(null);
  const name=domain.trim().toLowerCase().replace(/\.$/,'');
  if(name.length>253 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(name)) {setError('Enter a domain such as example.com, not a URL.');return;}
  setBusy(true);
  try {
   const response=await fetch('https://dns.google/resolve?'+new URLSearchParams({name,type:recordType}),{signal:AbortSignal.timeout(10000)});
   if(!response.ok) throw new Error();
   const data=await response.json();
   setResult({tool:'Public DNS',domain:name,recordType,checkedAt:new Date().toISOString(),resolver:'Google Public DNS',status:data.Status,answers:Array.isArray(data.Answer)?data.Answer:[],note:'The queried domain is sent to Google Public DNS. DNS records do not establish ownership or identity.'});
  } catch {setError('DNS request failed or timed out. No result can be inferred.');}
  finally {setBusy(false);}
 }
 function decode(e: React.FormEvent) {
  e.preventDefault();setError('');setResult(null);
  try {
   if(!/^\d{17,20}$/.test(id.trim())) throw new Error();
   const n=BigInt(id.trim());
   if(n>BigInt('18446744073709551615')) throw new Error();
   const timestamp=Number(n>>BigInt(22))+1420070400000;
   if(timestamp>Date.now()) throw new Error();
   setResult({tool:'Local Discord snowflake decoder',id:id.trim(),encodedTimestamp:new Date(timestamp).toISOString(),note:'Decoded locally. Does not verify an account exists or reveal private information. Other Discord objects also use snowflake IDs.'});
  } catch {setError('Invalid or future-dated Discord snowflake.');}
 }
 function download() {
  if(!result)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='security-check.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 return <main className="workspace" style={{margin:'0 auto'}}><header><a href="/">← Exposure dashboard</a><span className="badge">PUBLIC / LOCAL TOOLS</span></header><h1>Security utilities.</h1><p className="muted">Public infrastructure checks and local identifier inspection. No private databases or credential retrieval.</p><section className="panel"><h2>Public DNS lookup</h2><p className="muted">The domain you enter is sent to Google Public DNS.</p><form onSubmit={dns}><label>Record type<select value={recordType} onChange={e=>setRecordType(e.target.value)}>{['A','AAAA','MX','TXT','NS','CNAME','CAA'].map(t=><option key={t}>{t}</option>)}</select></label><label>Domain<input required value={domain} onChange={e=>setDomain(e.target.value)} placeholder="example.com"/></label><button disabled={busy}>{busy?'Checking…':'Query DNS'}</button></form></section><section className="panel"><h2>Discord ID decoder</h2><p className="muted">Decode an embedded timestamp locally. This is not a profile or breach lookup.</p><form onSubmit={decode}><label>Mode<input readOnly value="Local only"/></label><label>Snowflake ID<input required maxLength={20} inputMode="numeric" value={id} onChange={e=>setId(e.target.value)}/></label><button>Decode ID</button></form></section><section className="panel" aria-live="polite"><h2>Results</h2>{error&&<p role="alert">{error}</p>}{result!==null?<><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:13}}>{JSON.stringify(result,null,2)}</pre><button onClick={download}>Export this result as JSON</button></>:<p className="muted">Run a check to see actual results. No sample matches are generated.</p>}</section></main>;
}
