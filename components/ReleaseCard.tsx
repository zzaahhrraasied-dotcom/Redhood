'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import Countdown from './Countdown';

type Release={id:string;slug:string;title:string;cover_url:string|null;release_date:string;release_type:string;description:string|null;status:string;spotify_url:string|null;soundcloud_url:string|null;youtube_url:string|null;countdown_enabled:boolean;coming_soon_label:string|null;timezone:string|null};

export default function ReleaseCard({item,detailLink=true}:{item:Release;detailLink?:boolean}){
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
  const upcoming=item.status==='upcoming'&&new Date(item.release_date).getTime()>now;
  const releaseHref='/music/'+encodeURIComponent(String(item.slug||item.id).trim());
  const title=<h3 className="display text-2xl uppercase">{item.title}</h3>;
  return <article className="music-card border border-zinc-800 bg-[#101010] p-3">
    <div className="aspect-square bg-zinc-900 overflow-hidden relative">
      {detailLink?<Link href={releaseHref} aria-label={'Open '+item.title}>{item.cover_url?<img src={item.cover_url} alt={item.title+' cover'} className="w-full h-full object-cover transition duration-700 hover:scale-105"/>:<div className="w-full h-full flex items-center justify-center display text-4xl text-zinc-700">RH</div>}</Link>:item.cover_url?<img src={item.cover_url} alt={item.title+' cover'} className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center display text-4xl text-zinc-700">RH</div>}
      <span className="absolute top-3 left-3 bg-black/80 px-3 py-2 text-[9px] tracking-[.18em] uppercase">{upcoming?'UPCOMING':item.release_type}</span>
    </div>
    <div className="pt-5 px-1 pb-2">
      <div className="flex items-start justify-between gap-3">
        <div>{detailLink?<Link href={releaseHref} className="hover:text-zinc-400 transition">{title}</Link>:title}<p className="text-[10px] text-zinc-500 mt-2">{new Date(item.release_date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p></div>
        <span className="text-[9px] text-zinc-600 tracking-widest">{item.release_type}</span>
      </div>
      {item.description&&<p className="text-sm text-zinc-400 leading-6 mt-4">{item.description}</p>}
      {upcoming?<><Countdown date={item.release_date} enabled={item.countdown_enabled} label={item.coming_soon_label||'COMING SOON'}/>{detailLink&&<Link href={releaseHref} className="btn btn-dark mt-5 inline-flex">VIEW RELEASE ↗</Link>}</>:<div className="flex flex-wrap gap-2 mt-5">{item.spotify_url&&<a className="btn" href={item.spotify_url} target="_blank" rel="noreferrer">Spotify ↗</a>}{item.soundcloud_url&&<a className="btn btn-dark" href={item.soundcloud_url} target="_blank" rel="noreferrer">SoundCloud ↗</a>}{item.youtube_url&&<a className="btn btn-dark" href={item.youtube_url} target="_blank" rel="noreferrer">YouTube ↗</a>}</div>}
    </div>
  </article>;
}
