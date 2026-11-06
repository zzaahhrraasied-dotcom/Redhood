import Link from 'next/link';
import Header from '@/components/Header';
import ReleaseCard from '@/components/ReleaseCard';
import {getReleases} from '@/lib/data';

export const revalidate=0;

export default async function DiscographyPage(){
  const releases=await getReleases('released');
  return <><Header/><main className="min-h-screen pt-32 pb-24">
    <section className="section pt-8">
      <div className="max-w-[1500px] mx-auto">
        <div className="eyebrow mb-5">RED HOOD / THE CATALOG</div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-12">
          <h1 className="display text-6xl sm:text-8xl uppercase">DISCOGRAPHY</h1>
          <span className="text-xs tracking-widest text-zinc-600">{releases.length.toString().padStart(2,'0')} RELEASES</span>
        </div>
        {releases.length>0?<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{releases.map((item:any)=><ReleaseCard key={item.id} item={item}/>)}</div>:<div className="border border-zinc-800 bg-[#101010] p-8 text-sm text-zinc-500">No releases published yet.</div>}
        <Link href="/" className="btn btn-dark mt-12 inline-flex">← Back to home</Link>
      </div>
    </section>
  </main></>;
}
