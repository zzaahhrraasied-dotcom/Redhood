import {notFound} from 'next/navigation';
import Header from '@/components/Header';
import ReleaseCard from '@/components/ReleaseCard';
import {getReleases} from '@/lib/data';

export const revalidate=0;

export default async function MusicPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const item=(await getReleases()).find((x:any)=>x.slug===slug);
  if(!item)notFound();
  return <><Header/><main className="min-h-screen pt-32 section"><div className="max-w-xl mx-auto"><ReleaseCard item={item} detailLink={false}/></div></main></>;
}
