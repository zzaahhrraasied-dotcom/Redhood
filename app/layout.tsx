import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'RED HOOD | Official Website', description: 'Official website of RED HOOD. Music, releases and updates.', metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), openGraph: { title: 'RED HOOD', description: 'Independent artist. South Tehran DNA.', type: 'website' } };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
