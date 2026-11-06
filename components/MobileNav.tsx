'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

type NavPage = { id: string; title: string; slug: string };

export default function MobileNav({ pages }: { pages: NavPage[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button type="button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(value => !value)} className="flex h-11 w-11 items-center justify-center border border-zinc-700 text-white transition hover:bg-white hover:text-black">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute left-0 right-0 top-full border-b border-white/10 bg-[#080808]/[.98] px-6 py-6 shadow-2xl">
        <div className="flex flex-col">
          <Link onClick={close} href="/" className="border-b border-white/10 py-4 text-xs uppercase tracking-[.2em] text-zinc-300 hover:text-white">Home</Link>
          <Link onClick={close} href="/#music" className="border-b border-white/10 py-4 text-xs uppercase tracking-[.2em] text-zinc-300 hover:text-white">Music</Link>
          <Link onClick={close} href="/music" className="border-b border-white/10 py-4 text-xs uppercase tracking-[.2em] text-zinc-300 hover:text-white">Discography</Link>
          {pages.map(page => <Link key={page.id} onClick={close} href={'/'+page.slug} className="border-b border-white/10 py-4 text-xs uppercase tracking-[.2em] text-zinc-300 hover:text-white">{page.title}</Link>)}
        </div>
        <Link onClick={close} href="/music" className="btn mt-6 w-full">Explore releases ↗</Link>
      </nav>}
    </div>
  );
}
