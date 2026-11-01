import { NextResponse } from 'next/server';
export async function POST(request: Request) {
 let body: { type?: string; value?: string };
 try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }
 if (typeof body.value !== 'string' || !body.value.trim() || body.value.length > 254) return NextResponse.json({ error: 'Supply a valid identifier.' }, { status: 400 });
 const value = body.value.trim();
 if (!['email', 'username', 'discord'].includes(body.type || '')) return NextResponse.json({ error: 'Unsupported identifier type.' }, { status: 400 });
 if (body.type !== 'email') return NextResponse.json({ message: 'This identifier type requires a configured provider. No search was performed.', records: [] });
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
 if (!process.env.HIBP_API_KEY) return NextResponse.json({ message: 'Email source is not configured. Add HIBP_API_KEY on the server. No search was performed.', records: [] });
 try {
  const r = await fetch('https://haveibeenpwned.com/api/v3/breachedaccount/' + encodeURIComponent(value) + '?truncateResponse=false', { headers: { 'hibp-api-key': process.env.HIBP_API_KEY, 'user-agent': 'ExposureCheck' }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (r.status === 404) return NextResponse.json({ message: 'No indexed matches returned by Have I Been Pwned. This does not guarantee no exposure.', records: [] });
  if (!r.ok) return NextResponse.json({ error: 'Email source unavailable or rate-limited. No clean result can be inferred.' }, { status: 502 });
  const data = await r.json();
  if (!Array.isArray(data)) throw new Error('Invalid response');
  const records = data.map((b: { Name?: string; BreachDate?: string; DataClasses?: string[] }) => ({ breachName: b.Name || 'Unnamed breach', breachDate: b.BreachDate, source: 'Have I Been Pwned', dataClasses: Array.isArray(b.DataClasses) ? b.DataClasses.filter(d => typeof d === 'string') : [] }));
  return NextResponse.json({ message: records.length + ' breach entries returned.', records }, { headers: { 'Cache-Control': 'no-store' } });
 } catch { return NextResponse.json({ error: 'Email source request failed or timed out.' }, { status: 502 }); }
}
