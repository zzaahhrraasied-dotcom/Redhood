import { serverSupabase } from './supabase';

export async function getSettings() {
  const db = await serverSupabase();
  const { data } = await db
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  return data || {
    site_name: 'RED HOOD',
    bio: 'Independent artist. South Tehran DNA.',
    profile_image: '',
    logo_url: '',
    spotify_url: '',
    soundcloud_url: '',
    instagram_url: '',
    youtube_url: '',
    featured_release_id: null,
  };
}

export async function getReleases(status?: string) {
  const db = await serverSupabase();
  const { data } = await db
    .from('releases')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('release_at', { ascending: false });

  const now = Date.now();
  const releases = (data || []).map((release: any) => {
    const releaseTime = release.release_at ? new Date(release.release_at).getTime() : Number.NaN;
    const normalizedStatus =
      release.status === 'upcoming' && Number.isFinite(releaseTime) && releaseTime <= now
        ? 'released'
        : release.status;

    return {
      ...release,
      status: normalizedStatus,
      // Normalize legacy slugs so whitespace at either end cannot break release URLs.
      slug: String(release.slug || '').trim(),
      // Keep the UI's established field names while reading the live DB schema.
      release_date: release.release_at,
      release_type: release.type,
      timezone: release.release_timezone,
    };
  });

  return status ? releases.filter((release: any) => release.status === status) : releases;
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
