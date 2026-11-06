import Link from 'next/link';
import Header from '@/components/Header';
import ReleaseCard from '@/components/ReleaseCard';
import Countdown from '@/components/Countdown';
import {getReleases,getSettings,getPages} from '@/lib/data';
import {Instagram, Youtube, Music2, Cloud} from 'lucide-react';

export const revalidate=0;

export default async function Home(){
  const [s,all,pages]=await Promise.all([getSettings(),getReleases(),getPages()]);
  const now=Date.now();
  const released=all.filter((x:any)=>x.status==='released');
  const upcoming=all.filter((x:any)=>x.status==='upcoming');
  const recentRelease=released
    .filter((x:any)=>{
      const time=new Date(x.release_date||x.release_at).getTime();
      return Number.isFinite(time)&&time<=now&&now-time<24*60*60*1000;
    })
    .sort((a:any,b:any)=>new Date(b.release_date||b.release_at).getTime()-new Date(a.release_date||a.release_at).getTime())[0];
  const nextRelease=upcoming
    .filter((x:any)=>Number.isFinite(new Date(x.release_date||x.release_at).getTime())&&new Date(x.release_date||x.release_at).getTime()>now)
    .sort((a:any,b:any)=>new Date(a.release_date||a.release_at).getTime()-new Date(b.release_date||b.release_at).getTime())[0];
  // Keep OUT NOW visible for the full first 24 hours; otherwise feature the next upcoming release.
  const heroRelease=recentRelease||nextRelease;
  const heroIsUpcoming=!!heroRelease&&!recentRelease;
  const featured=all.find((x:any)=>x.id===s.featured_release_id)||released[0];

  return <><Header/><main>
    <section className="min-h-[92vh] pt-28 px-6 relative flex items-end overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,#292929_0%,#111_25%,#080808_68%)]"/>
      <div className="absolute inset-0 grain opacity-30"/>
      {(heroRelease?.cover_url||s.profile_image)&&<img src={heroRelease?.cover_url||s.profile_image} alt={heroRelease?heroRelease.title+' cover':'RED HOOD artist portrait'} className="absolute right-[4%] bottom-0 h-[72%] max-w-[55%] object-contain object-bottom opacity-65 mix-blend-lighten"/>}
      <div className="relative z-10 max-w-[1500px] mx-auto w-full pb-20 text-center">
        {heroRelease?<>
          <div className="eyebrow mb-7">{heroIsUpcoming?'UPCOMING':'OUT NOW'} · RED HOOD</div>
          <h1 className="display uppercase leading-[.86] text-[clamp(4rem,12vw,12rem)] tracking-[-.045em] max-w-[1000px]">{heroRelease.title}</h1>
          <div className="mt-10 flex flex-col items-center justify-center text-center gap-8">
            <div className="max-w-xl mx-auto">
              {heroRelease.description&&<p className="text-zinc-400 leading-7 text-sm">{heroRelease.description}</p>}
              {heroIsUpcoming?<Countdown date={heroRelease.release_date||heroRelease.release_at} enabled={heroRelease.countdown_enabled} label={heroRelease.coming_soon_label||'COMING SOON'}/>:<div className="flex flex-wrap justify-center gap-2 mt-5">
                {heroRelease.spotify_url&&<a className="btn" href={heroRelease.spotify_url} target="_blank" rel="noreferrer">Spotify</a>}
                {heroRelease.soundcloud_url&&<a className="btn btn-dark" href={heroRelease.soundcloud_url} target="_blank" rel="noreferrer">SoundCloud</a>}
                {heroRelease.youtube_url&&<a className="btn btn-dark" href={heroRelease.youtube_url} target="_blank" rel="noreferrer">YouTube</a>}
              </div>}
              <Link href={'/music/'+encodeURIComponent(String(heroRelease.slug||heroRelease.id).trim())} className="btn btn-dark mt-5 inline-flex">VIEW RELEASE</Link>
            </div>
            <div className="flex w-full justify-center gap-4 items-center">
              {s.spotify_url&&<a aria-label="Spotify" href={s.spotify_url} target="_blank" rel="noreferrer"><Music2/></a>}
              {s.soundcloud_url&&<a aria-label="SoundCloud" href={s.soundcloud_url} target="_blank" rel="noreferrer"><Cloud/></a>}
              {s.instagram_url&&<a aria-label="Instagram" href={s.instagram_url} target="_blank" rel="noreferrer"><Instagram/></a>}
              {s.youtube_url&&<a aria-label="YouTube" href={s.youtube_url} target="_blank" rel="noreferrer"><Youtube/></a>}
            </div>
          </div>
        </>:<>
          <div className="eyebrow mb-7">Independent artist · 021 · South Tehran</div>
          <h1 className="display uppercase leading-[.78] text-[clamp(5rem,17vw,17rem)] tracking-[-.045em]">RED<br/><span className="text-zinc-500">HOOD</span></h1>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            <p className="max-w-xl mx-auto text-zinc-400 leading-7 text-sm">{s.bio||'Independent artist. South Tehran DNA.'}</p>
            <div className="flex w-full justify-center gap-4 items-center">
              {s.spotify_url&&<a aria-label="Spotify" href={s.spotify_url} target="_blank" rel="noreferrer"><Music2/></a>}
              {s.soundcloud_url&&<a aria-label="SoundCloud" href={s.soundcloud_url} target="_blank" rel="noreferrer"><Cloud/></a>}
              {s.instagram_url&&<a aria-label="Instagram" href={s.instagram_url} target="_blank" rel="noreferrer"><Instagram/></a>}
              {s.youtube_url&&<a aria-label="YouTube" href={s.youtube_url} target="_blank" rel="noreferrer"><Youtube/></a>}
            </div>
          </div>
        </>}
      </div>
      <div className="absolute bottom-7 left-0 right-0 text-center text-[9px] tracking-[.25em] text-zinc-600">SCROLL TO EXPLORE</div>
    </section>

    {featured&&heroRelease?.id!==featured.id&&<section className="section border-t border-zinc-900">
      <div className="max-w-[1300px] mx-auto grid md:grid-cols-2 gap-12 items-center text-center">
        <div>
          <div className="eyebrow mb-5">Selected release / 001</div>
          <h2 className="display text-6xl sm:text-8xl uppercase">{featured.title}</h2>
          <p className="text-zinc-500 text-sm mt-5 max-w-md">{featured.description}</p>
          <a href={featured.spotify_url||featured.soundcloud_url||featured.youtube_url||'/music'} target="_blank" rel="noreferrer" className="btn mt-8">Listen now</a>
        </div>
        <div className="aspect-square border border-zinc-800 bg-zinc-900 overflow-hidden">{featured.cover_url&&<img src={featured.cover_url} alt={featured.title+' cover'} className="w-full h-full object-cover"/>}</div>
      </div>
    </section>}

    {pages.length>0&&<section id="pages" className="section border-y border-zinc-900">
      <div className="max-w-[1500px] mx-auto">
        <div className="eyebrow mb-4 text-center">Explore the world</div>
        <h2 className="display text-5xl sm:text-8xl mb-12 text-center">MORE FROM RED HOOD</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pages.map((page:any)=><Link key={page.id} href={'/'+page.slug} className="group block border border-zinc-800 bg-[#101010] p-3 transition hover:border-zinc-500">
            {page.hero_image?<div className="aspect-[16/10] bg-zinc-900 overflow-hidden mb-5"><img src={page.hero_image} alt="" className="w-full h-full object-cover transition duration-700 group-hover:scale-105"/></div>:<div className="aspect-[16/10] bg-[#0b0b0b] border border-zinc-900 flex items-center justify-center mb-5"><span className="display text-4xl text-zinc-700">RED HOOD</span></div>}
            <div className="flex items-center justify-center gap-4 px-1 pb-2 text-center">
              <h3 className="display text-2xl uppercase">{page.title}</h3>
              <span className="text-xs text-zinc-500 group-hover:text-white">OPEN</span>
            </div>
          </Link>)}
        </div>
      </div>
    </section>}

    <section id="music" className="section bg-[#0b0b0b] border-y border-zinc-900">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col items-center justify-center gap-4 mb-12 text-center">
          <div className="min-w-0 w-full text-center">
            <div className="eyebrow mb-4">The catalog</div>
            <Link href="/music" className="group inline-flex items-center gap-4">
              <h2 className="display text-5xl sm:text-8xl transition group-hover:text-zinc-400">DISCOGRAPHY</h2>
            </Link>
          </div>
          <span className="text-xs text-zinc-600 whitespace-nowrap">{released.length.toString().padStart(2,'0')} RELEASES</span>
        </div>
        {released.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{released.map((x:any)=><ReleaseCard key={x.id} item={x}/>)}</div> : <p className="text-zinc-600 text-sm">No releases published yet.</p>}
      </div>
    </section>

    <footer className="border-t border-zinc-900 px-6 py-10">
      <div className="max-w-[1500px] mx-auto flex flex-col items-center justify-center text-center gap-4">
        <span className="display tracking-[.2em]">RED HOOD © {new Date().getFullYear()}</span>
        <span className="text-[9px] tracking-[.2em] text-zinc-600">INDEPENDENT BY DESIGN.</span>
        <a href="/admin" className="text-[9px] tracking-[.2em] text-zinc-700">ADMIN</a>
      </div>
    </footer>
  </main></>;
}
