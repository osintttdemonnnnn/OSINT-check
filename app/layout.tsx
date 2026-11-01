import './globals.css';
import type { ReactNode } from 'react';
export const metadata = { title: 'OSINT / CHECK — Research Workspace', description: 'Source-aware public research and local evidence organization. Not affiliated with law enforcement.' };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="en"><body><nav aria-label="Workspace sections" style={{display:'flex',flexWrap:'wrap',gap:20,padding:'14px 20px',background:'#101720',borderBottom:'1px solid #354555',fontSize:14}}><a href="/" style={{color:'#8de4ce'}}>Research dashboard</a><a href="/workspace" style={{color:'#8de4ce'}}>All 44 original tools</a><a href="/tools" style={{color:'#8de4ce'}}>DNS / Discord / export utilities</a></nav>{children}</body></html>; }
