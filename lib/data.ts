import { serverSupabase } from './supabase';

export async function getSettings() {
  const db = await serverSupabase();
  const { data } = await db
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  return data || {
    artist_name: 'RED HOOD',
    bio: 'Independent artist. South Tehran DNA.',
    profile_image: '',
    logo_image: '',
    spotify_url: '',
    soundcloud_url: '',
    instagram_url: '',
    youtube_url: '',
    featured_release_id: null,
  };
}

export async function getReleases(status?: string) {
  const db = await serverSupabase();
  await db.rpc('publish_due_releases');

  let q = db
    .from('releases')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('release_at', { ascending: false });

  if (status) q = q.eq('status', status);

  const { data } = await q;
  return (data || []).map((release: any) => ({
    ...release,
    // Keep the UI's established field names while reading the live DB schema.
    release_date: release.release_at,
    release_type: release.type,
    timezone: release.release_timezone,
  }));
}

export async function getPages() {
  const db = await serverSupabase();
  const { data } = await db
    .from('pages')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  return (data || []).map((page: any) => ({
    ...page,
    hero_image: page.hero_image_url || '',
    published: !!page.is_published,
  }));
}
