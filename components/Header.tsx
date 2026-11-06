import Link from 'next/link';
import { getPages, getSettings } from '@/lib/data';
import MobileNav from './MobileNav';

export default async function Header() {
  const [s, p] = await Promise.all([getSettings(), getPages()]);

  return (
    <header className="fixed z-50 top-0 left-0 right-0 border-b border-white/10 bg-black/75 backdrop-blur-xl">
      <div className="max-w-[1500px] mx-auto px-6 h-[76px] flex items-center justify-between">
        <Link href="/" className="display text-2xl tracking-[.12em]">
          {s.logo_image ? (
            <img src={s.logo_image} alt="RED HOOD" className="h-9 w-auto" />
          ) : (
            'RED HOOD'
          )}
        </Link>

        <nav className="hidden md:flex gap-8 text-[10px] tracking-[.2em] uppercase text-zinc-400">
          <Link href="/#music" className="hover:text-white">Music</Link>
          <Link href="/#upcoming" className="hover:text-white">Upcoming</Link>
          {p.map((x: any) => (
            <Link key={x.id} href={'/' + x.slug} className="hover:text-white">
              {x.title}
            </Link>
          ))}
        </nav>

        <Link
          href="/#music"
          className="hidden md:inline-flex text-[10px] tracking-[.18em] uppercase border border-zinc-700 px-4 py-3 hover:bg-white hover:text-black transition"
        >
          Explore releases ↗
        </Link>

        <MobileNav pages={p.map((x: any) => ({
          id: String(x.id),
          title: String(x.title),
          slug: String(x.slug),
        }))} />
      </div>
    </header>
  );
}
