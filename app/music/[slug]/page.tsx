import {notFound} from 'next/navigation';
import Header from '@/components/Header';
import ReleaseLanding from '@/components/ReleaseLanding';
import {getReleases,getSettings} from '@/lib/data';

export const revalidate=0;

export default async function MusicPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const [releases,settings]=await Promise.all([getReleases(),getSettings()]);
  const normalizedSlug=decodeURIComponent(slug).trim();
  const item=releases.find((release:any)=>
    String(release.slug||'').trim()===normalizedSlug ||
    String(release.id||'').trim()===normalizedSlug
  );
  if(!item)notFound();

  return (
    <>
      <Header/>
      <ReleaseLanding item={item} settings={settings}/>
    </>
  );
}
