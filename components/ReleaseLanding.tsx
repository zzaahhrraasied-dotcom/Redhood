'use client';

import {useEffect,useState} from 'react';
import Countdown from '@/components/Countdown';
import {Instagram, Youtube, Music2, Cloud} from 'lucide-react';

type Release = {
  title:string;
  slug:string;
  type:string;
  release_type:string;
  release_date:string;
  description:string|null;
  cover_url:string|null;
  status:string;
  spotify_url:string|null;
  soundcloud_url:string|null;
  youtube_url:string|null;
  countdown_enabled:boolean;
  coming_soon_label:string|null;
};
type Settings = {
  site_name?:string|null;
  profile_image?:string|null;
  instagram_url?:string|null;
  spotify_url?:string|null;
  soundcloud_url?:string|null;
  youtube_url?:string|null;
};

function PlatformIcon({label}:{label:string}) {
  const common = {size:28, strokeWidth:1.7, 'aria-hidden':true as const};
  if (label==='Instagram') return <Instagram {...common}/>;
  if (label==='YouTube') return <Youtube {...common}/>;
  if (label==='Spotify') return <Music2 {...common}/>;
  return <Cloud {...common}/>;
}

function cleanUrl(value?:string|null) {
  return typeof value==='string' ? value.trim() : '';
}

export default function ReleaseLanding({item,settings}:{item:Release;settings:Settings}) {
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{
    const timer=setInterval(()=>setNow(Date.now()),1000);
    return ()=>clearInterval(timer);
  },[]);

  const isReleased=item.status==='released'||new Date(item.release_date).getTime()<=now;
  const artistLinks=[
    {label:'Instagram',url:cleanUrl(settings.instagram_url)},
    {label:'SoundCloud',url:cleanUrl(settings.soundcloud_url)},
    {label:'Spotify',url:cleanUrl(settings.spotify_url)},
    {label:'YouTube',url:cleanUrl(settings.youtube_url)},
  ].filter(link=>link.url);
  const releaseLinks=[
    {label:'Spotify',url:cleanUrl(item.spotify_url)},
    {label:'SoundCloud',url:cleanUrl(item.soundcloud_url)},
    {label:'YouTube',url:cleanUrl(item.youtube_url)},
  ].filter(link=>link.url);

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center">
          {settings.profile_image ? (
            <img
              src={settings.profile_image}
              alt={settings.site_name||'Artist'}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border border-zinc-700"
            />
          ) : (
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center display text-3xl text-zinc-500">
              RH
            </div>
          )}
          <p className="eyebrow mt-6">{settings.site_name||'RED HOOD'}</p>
          {artistLinks.length>0&&(
            <nav aria-label="Artist platforms" className="mt-7 flex flex-wrap items-center justify-center gap-5 sm:gap-6">
              {artistLinks.map(link=>(
                <a key={link.label} aria-label={link.label} title={link.label} href={link.url} target="_blank" rel="noreferrer"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-zinc-700 bg-zinc-950/70 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-400 hover:bg-zinc-900 transition">
                  <PlatformIcon label={link.label}/>
                </a>
              ))}
            </nav>
          )}
          <div className="mt-7 border border-zinc-700 px-4 py-2 text-[10px] tracking-[.28em]">
            {isReleased?'OUT NOW':'UPCOMING'}
          </div>
          <h1 className="display uppercase text-5xl sm:text-7xl mt-7 tracking-wide">{item.title}</h1>
          <p className="text-[10px] text-zinc-500 tracking-[.22em] uppercase mt-4">
            {item.release_type||item.type}
          </p>
        </div>

        {item.cover_url&&(
          <div className="max-w-xl mx-auto mt-12 border border-zinc-800 bg-zinc-950 p-2">
            <img src={item.cover_url} alt={item.title+' cover'} className="w-full aspect-square object-cover"/>
          </div>
        )}

        {item.description&&(
          <p className="max-w-2xl mx-auto mt-8 text-center text-sm leading-7 text-zinc-400 whitespace-pre-wrap">
            {item.description}
          </p>
        )}

        {!isReleased&&(
          <div className="max-w-xl mx-auto mt-10 text-center">
            <Countdown
              date={item.release_date}
              enabled={item.countdown_enabled}
              label={item.coming_soon_label||'COMING SOON'}
            />
          </div>
        )}

        {isReleased&&releaseLinks.length>0&&(
          <section className="mt-10 text-center">
            <p className="eyebrow mb-5">Listen now</p>
            <div className="flex flex-wrap justify-center items-center gap-5 sm:gap-6">
              {releaseLinks.map(link=>(
                <a key={link.label} aria-label={'Listen on '+link.label} title={link.label} href={link.url} target="_blank" rel="noreferrer"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-zinc-700 bg-zinc-950/70 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-400 hover:bg-zinc-900 transition">
                  <PlatformIcon label={link.label}/>
                </a>
              ))}
            </div>
          </section>
        )}


        <div className="mt-16 text-center">
          <a href="/music" className="text-[10px] tracking-[.2em] text-zinc-500 hover:text-white transition">
            BACK TO DISCOGRAPHY
          </a>
        </div>
      </div>
    </main>
  );
}
