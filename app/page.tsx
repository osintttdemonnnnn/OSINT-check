"use client";
import { useState } from 'react';
type Result = { records?: { breachName: string; breachDate?: string; source: string; dataClasses: string[] }[]; message?: string; error?: string };
export default function Page() {
 const [type, setType] = useState('email');
 const [value, setValue] = useState('');
 const [busy, setBusy] = useState(false);
 const [result, setResult] = useState<Result | null>(null);
 async function scan(e: React.FormEvent) {
  e.preventDefault(); setBusy(true); setResult(null);
  try {
   const r = await fetch('/api/breach-scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, value }) });
   const data = await r.json(); setResult(data);
  } catch { setResult({ error: 'Request failed. Try again later.' }); }
  finally { setBusy(false); }
 }
 return <main className="shell">
  <aside><div className="brand">EXPOSURE / CHECK</div><p>Security workspace</p><nav>Overview<br/>Account exposure<br/>Source status</nav><small>Authorized account checks only.<br/>No credentials or private records displayed.</small></aside>
  <section className="workspace"><header><span>WORKSPACE / OVERVIEW</span><span className="badge">ACCOUNT SECURITY</span></header>
   <h1>Know your exposure.</h1><p className="muted">Check supplied identifiers against configured sources. A match is not proof of account takeover.</p>
   <div className="metrics"><article><small>IDENTIFIER TYPES</small><h2>03</h2><p>Email · Username · Discord ID</p></article><article><small>RESULT QUALITY</small><h2>Source-backed</h2><p>No invented confidence scores</p></article><article><small>PRIVACY</small><h2>Metadata only</h2><p>No leaked passwords displayed</p></article></div>
   <section className="panel"><h2>Exposure lookup</h2><form onSubmit={scan}><label>Identifier type<select value={type} onChange={e => { setType(e.target.value); setResult(null); }}><option value="email">Email address</option><option value="username">Username</option><option value="discord">Discord ID</option></select></label><label>Identifier<input required maxLength={254} type={type === 'email' ? 'email' : 'text'} value={value} onChange={e => setValue(e.target.value)} placeholder={type === 'email' ? 'you@example.com' : type === 'discord' ? 'Discord user ID' : 'Your username'}/></label><button disabled={busy}>{busy ? 'Checking…' : 'Check exposure →'}</button></form><p className="muted">Submit only your own identifier or one you have permission to check.</p></section>
   {result && <section className="panel" aria-live="polite"><h2>Lookup results</h2><p>{result.error || result.message}</p>{result.records?.map((r, i) => <article className="record" key={i}><h3>{r.breachName}</h3><p>{r.source} · {r.breachDate || 'Date unavailable'}</p><div>{r.dataClasses.map(d => <span className="badge" key={d}>{d}</span>)}</div></article>)}</section>}
   <section className="panel"><h2>Source coverage</h2><p>Email: Have I Been Pwned, when configured on the server.</p><p>Username / Discord: provider setup required. No automatic identity linking.</p><p className="muted">Not all breaches are indexed. Source outages and missing configuration are not clean results.</p></section>
  </section></main>;
}
