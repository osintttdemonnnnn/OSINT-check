import { NextResponse } from 'next/server';
import { promises as dns } from 'node:dns';
import { isIP } from 'node:net';
import { domainToASCII } from 'node:url';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
 const reply = (data: unknown, status = 200) => NextResponse.json(data, {status, headers: {'Cache-Control':'no-store'}});
 try {
  const body = await request.json();
  const value = typeof body.value === 'string' ? body.value.trim() : '';
  if (!value || value.length > 254) return reply({error:'Enter a value of at most 254 characters.'},400);
  if (body.tool === 'IP address') {
   const version = isIP(value);
   if (!version) return reply({error:'Enter a valid IPv4 or IPv6 address.'},400);
   let hostnames: string[] = [];
   try { hostnames = await dns.reverse(value); } catch {}
   return reply({address:value,version:`IPv${version}`,hostnames,note:'Reverse DNS names are not proof of identity. No location or ownership claim is made.'});
  }
  if (body.tool !== 'Email' && body.tool !== 'Domain / DNS') return reply({error:'Unsupported tool.'},400);
  const email = body.tool === 'Email';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return reply({error:'Enter an email address such as name@example.com.'},400);
  const domain = domainToASCII(email ? value.split('@')[1] : value).toLowerCase().replace(/\.$/,'');
  if (!domain || domain.length > 253 || !domain.includes('.') || !domain.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return reply({error:'Enter a valid public domain, without a URL or path.'},400);
  const resolver = new dns.Resolver({timeout:2000,tries:1});
  const results = await Promise.allSettled([resolver.resolve4(domain),resolver.resolve6(domain),resolver.resolveMx(domain),resolver.resolveTxt(domain),resolver.resolveNs(domain)]);
  const records: Record<string,unknown> = {};
  const errors: Record<string,string> = {};
  ['A','AAAA','MX','TXT','NS'].forEach((key,index) => { const result = results[index]; if(result.status === 'fulfilled') records[key] = result.value; else {records[key] = []; errors[key] = typeof result.reason?.code === 'string' ? result.reason.code : 'LOOKUP_FAILED';} });
  return reply({domain,...(email ? {format:'Basic syntax check passed',mailbox:'Not verified',breaches:'Not checked'} : {}),records,lookupStatus:errors,note:'DNS records describe the domain, not the person. Missing MX alone does not prove an address cannot receive mail. Lookup errors may be temporary.'});
 } catch { return reply({error:'Unable to complete the check. Please try again.'},400); }
}
