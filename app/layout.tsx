import './globals.css';
import type { ReactNode } from 'react';
export const metadata = { title: 'OSINT / CHECK — Research Workspace', description: 'Source-aware public research and local evidence organization. Not affiliated with law enforcement.' };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
