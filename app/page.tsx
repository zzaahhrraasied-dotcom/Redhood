import Header from '@/components/Header';import ReleaseCard from '@/components/ReleaseCard';import {getReleases,getSettings} from '@/lib/data';import {Instagram, Youtube, Music2, Cloud} from 'lucide-react';
export const revalidate=0;
export default async function Home(){const [s,all]=await Promise.all([getSettings(),getReleases()]);const released=all.filter((x:any)=>x.status==='released');const upcoming=all.filter((x:any)=>x.status==='upcoming');const featured=all.find((x:any)=>x.id===s.featured_release_id)||released[0];return <><Header/><main><section className="min-h-[92vh] pt-28 px-6 relative flex items-end overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,#292929_0%,#111_25%,#080808_68%)]"/><div className="absolute inset-0 grain opacity-30"/>{s.profile_image&&<img src={s.profile_image} alt="RED HOOD artist portrait" className="absolute right-[4%] bottom-0 h-[72%] max-w-[55%] object-contain object-bottom opacity-65 mix-blend-lighten"/>}<div className="relative z-10 max-w-[1500px] mx-auto w-full pb-20"><div className="eyebrow mb-7">Independent artist · 021 · South Tehran</div><h1 className="display uppercase leading-[.78] text-[clamp(5rem,17vw,17rem)] tracking-[-.045em]">RED<br/><span className="text-zinc-500">HOOD</span></h1><div className="mt-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8"><p className="max-w-md text-zinc-400 leading-7 text-sm">{s.bio||'Independent artist. South Tehran DNA.'}</p><div className="flex gap-4 items-center">{s.spotify_url&&<a aria-label="Spotify" href={s.spotify_url} target="_blank" rel="noreferrer"><Music2/></a>}{s.soundcloud_url&&<a aria-label="SoundCloud" href={s.soundcloud_url} target="_blank" rel="noreferrer"><Cloud/></a>}{s.instagram_url&&<a aria-label="Instagram" href={s.instagram_url} target="_blank" rel="noreferrer"><Instagram/></a>}{s.youtube_url&&<a aria-label="YouTube" href={s.youtube_url} target="_blank" rel="noreferrer"><Youtube/></a>}</div></div></div><div className="absolute bottom-7 right-7 text-[9px] tracking-[.25em] text-zinc-600">SCROLL TO EXPLORE ↓</div></section>
{featured&&<section className="section border-t border-zinc-900"><div className="max-w-[1300px] mx-auto grid md:grid-cols-2 gap-12 items-center"><div><div className="eyebrow mb-5">Selected release / 001</div><h2 className="display text-6xl sm:text-8xl uppercase">{featured.title}</h2><p className="text-zinc-500 text-sm mt-5 max-w-md">{featured.description}</p><a href={featured.spotify_url||featured.soundcloud_url||featured.youtube_url||'/#music'} target="_blank" rel="noreferrer" className="btn mt-8">Listen now ↗</a></div><div className="aspect-square border border-zinc-800 bg-zinc-900 overflow-hidden">{featured.cover_url&&<img src={featured.cover_url} alt={featured.title+' cover'} className="w-full h-full object-cover"/>}</div></div></section>}
<section id="music" className="section bg-[#0b0b0b] border-y border-zinc-900">
  <div className="max-w-[1500px] mx-auto">

    <div className="flex flex-col items-start gap-4 mb-12 sm:flex-row sm:justify-between sm:items-end">
      <div className="min-w-0 w-full">
        <div className="eyebrow mb-4">The catalog</div>
        <h2 className="display text-5xl sm:text-8xl">DISCOGRAPHY</h2>
      </div>

      <span className="text-xs text-zinc-600 whitespace-nowrap">
        {released.length.toString().padStart(2,'0')} RELEASES
      </span>
    </div>

    {released.length ? (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {released.map((x:any) => (
          <ReleaseCard key={x.id} item={x}/>
        ))}
      </div>
    ) : (
      <p className="text-zinc-600 text-sm">
        No releases published yet.
      </p>
    )}

  </div>
</section>{upcoming.length>0&&<section id="upcoming" className="section"><div className="max-w-[1500px] mx-auto"><div className="eyebrow mb-4">Next transmissions</div><h2 className="display text-6xl sm:text-8xl mb-12">UPCOMING</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{upcoming.map((x:any)=><ReleaseCard key={x.id} item={x}/>)}</div></div></section>}
<footer className="border-t border-zinc-900 px-6 py-10"><div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row justify-between gap-4"><span className="display tracking-[.2em]">RED HOOD © {new Date().getFullYear()}</span><span className="text-[9px] tracking-[.2em] text-zinc-600">INDEPENDENT BY DESIGN.</span><a href="/admin" className="text-[9px] tracking-[.2em] text-zinc-700">ADMIN</a></div></footer></main></>}
