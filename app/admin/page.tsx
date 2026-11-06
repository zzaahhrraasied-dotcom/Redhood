
'use client';

import { useEffect, useState } from 'react';
import { browserSupabase } from '@/lib/supabase-browser';

type AnyRow = Record<string, any>;

const blankRelease = {
  title: '',
  slug: '',
  release_type: 'single',
  release_date: '',
  timezone: 'Asia/Tehran',
  description: '',
  cover_url: '',
  spotify_url: '',
  soundcloud_url: '',
  youtube_url: '',
  status: 'upcoming',
  countdown_enabled: true,
  coming_soon_label: 'COMING SOON',
  sort_order: 0,
};

const blankPage = {
  title: '',
  slug: '',
  content: '',
  hero_image: '',
  layout: 'standard',
  published: false,
  sort_order: 0,
};

function localInZone(iso: string, zone: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso)).replace(' ', 'T');
}

function dateInZone(local: string, zone: string) {
  const [d, t] = local.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = t.split(':').map(Number);

  const desired = Date.UTC(y, m - 1, day, hh, mm);
  let guess = desired;

  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(guess));

    const get = (k: string) =>
      Number(parts.find(p => p.type === k)?.value);

    const represented = Date.UTC(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour'),
      get('minute')
    );

    guess += desired - represented;
  }

  return new Date(guess).toISOString();
}

async function upload(file: File) {
  const f = new FormData();
  f.append('file', file);

  const r = await fetch('/api/upload', {
    method: 'POST',
    body: f,
  });

  const j = await r.json();

  if (!r.ok) throw new Error(j.error);

  return j.url;
}

export default function Admin() {
  const [tab, setTab] = useState('releases');
  const [releases, setReleases] = useState<AnyRow[]>([]);
  const [pages, setPages] = useState<AnyRow[]>([]);
  const [settings, setSettings] = useState<AnyRow>({});
  const [backgroundImage, setBackgroundImage] = useState('');
  const [release, setRelease] = useState<AnyRow>(blankRelease);
  const [page, setPage] = useState<AnyRow>(blankPage);
  const [editRelease, setEditRelease] = useState<string | null>(null);
  const [editPage, setEditPage] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const [r, p, s] = await Promise.all([
      fetch('/api/admin/releases'),
      fetch('/api/admin/pages'),
      fetch('/api/admin/settings'),
    ]);

    if (r.ok) setReleases(await r.json());
    if (p.ok) setPages(await p.json());
    if (s.ok) {
      const nextSettings = await s.json();
      setSettings(nextSettings);
      setBackgroundImage(nextSettings.background_image_url || '');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveRelease(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg('');

    try {
      const body = {
        title: release.title,
        slug: release.slug,
        type: String(release.release_type).toLowerCase(),
        release_at: dateInZone(
          release.release_date,
          release.timezone || 'Asia/Tehran'
        ),
        release_timezone: release.timezone || 'Asia/Tehran',
        description: release.description,
        cover_url: release.cover_url,
        spotify_url: release.spotify_url,
        soundcloud_url: release.soundcloud_url,
        youtube_url: release.youtube_url,
        status: release.status,
        countdown_enabled: release.countdown_enabled,
        coming_soon_label: release.coming_soon_label,
        sort_order: Number(release.sort_order) || 0,
      };

      const res = await fetch('/api/admin/releases', {
        method: editRelease ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editRelease ? { id: editRelease, ...body } : body
        ),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error);

      setRelease(blankRelease);
      setEditRelease(null);
      await load();
      setMsg('Release saved.');
    } catch (e) {
      setMsg((e as Error).message);
    }

    setBusy(false);
  }

  async function savePage(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg('');

    try {
      const {
        hero_image,
        published,
        ...pageFields
      } = page;

      const body = {
        ...pageFields,
        hero_image_url: hero_image,
        is_published: published,
        sort_order: Number(page.sort_order) || 0,
      };

      const res = await fetch('/api/admin/pages', {
        method: editPage ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editPage ? { id: editPage, ...body } : body
        ),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error);

      setPage(blankPage);
      setEditPage(null);
      await load();
      setMsg('Page saved.');
    } catch (e) {
      setMsg((e as Error).message);
    }

    setBusy(false);
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const j = await res.json();

      if (!res.ok) throw new Error(j.error);

      setMsg('Site settings saved.');
      await load();
    } catch (e) {
      setMsg((e as Error).message);
    }

    setBusy(false);
  }

  async function saveBackground(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg('');

    try {
      const res = await fetch('/api/admin/background', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ background_image_url: backgroundImage }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);

      setSettings((current) => ({
        ...current,
        background_image_url: j.background_image_url || '',
      }));
      setMsg('Background draft saved. The live website appearance is unchanged.');
    } catch (e) {
      setMsg((e as Error).message);
    }

    setBusy(false);
  }

  async function remove(kind: 'releases' | 'pages', id: string) {
    if (!confirm('Delete this item? This cannot be undone.')) return;

    const r = await fetch('/api/admin/' + kind, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    const j = await r.json();

    if (!r.ok) {
      setMsg(j.error);
    } else {
      setMsg('Deleted.');
      await load();
    }
  }

  async function signOut() {
    await browserSupabase().auth.signOut();
    location.href = '/admin/login';
  }

  // Image upload and preview.
  // Remove option is enabled only for artist profile image.
  function fileField(
    label: string,
    key: string,
    value: string,
    onChange: (v: string) => void,
    allowRemove = false
  ) {
    return (
      <div className="block">
        <label className="block text-xs text-zinc-400">
          {label}

          <input
            className="input mt-2"
            type="file"
            accept="image/*"
            onChange={async e => {
              const f = e.target.files?.[0];
              if (!f) return;

              try {
                const url = await upload(f);
                onChange(url);
                setMsg('Image uploaded.');
              } catch (err) {
                setMsg((err as Error).message);
              }
            }}
          />
        </label>

        {value && (
          <div className="mt-3 flex items-start gap-3">
            <img
              src={value}
              alt={label}
              className="h-24 w-24 object-cover border border-zinc-700"
            />

            {allowRemove && (
              <button
                type="button"
                className="btn btn-dark text-red-400"
                onClick={() => {
                  onChange('');
                  setMsg(
                    'Image removed. Save changes to keep this update.'
                  );
                }}
              >
                REMOVE IMAGE
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="admin-shell">
      <header className="border-b border-zinc-800 px-6 py-5 flex items-center justify-between">
        <div>
          <div className="eyebrow">Private control room</div>
          <div className="display text-2xl tracking-widest">
            RED HOOD / ADMIN
          </div>
        </div>

        <div className="flex gap-3">
          <a href="/" className="btn btn-dark">View site ↗</a>
          <button onClick={signOut} className="btn btn-dark">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto px-5 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="flex lg:flex-col gap-2 overflow-x-auto">
          {[
            ['releases', 'Music releases'],
            ['pages', 'Dynamic pages'],
            ['settings', 'Site identity'],
            ['background', 'Background'],
          ].map(([k, v]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`text-left px-4 py-3 text-xs tracking-widest uppercase whitespace-nowrap ${
                tab === k
                  ? 'bg-white text-black'
                  : 'border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </aside>

        <section className="min-w-0">
          {msg && (
            <div className="mb-5 border border-zinc-700 p-3 text-sm text-zinc-300">
              {msg}
            </div>
          )}

          {tab === 'releases' && (
            <div className="grid xl:grid-cols-[1fr_1fr] gap-6">
              <div className="admin-card">
                <div className="eyebrow mb-2">Catalog manager</div>

                <h1 className="display text-4xl mb-6">
                  {editRelease ? 'EDIT RELEASE' : 'ADD RELEASE'}
                </h1>

                <form onSubmit={saveRelease} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="text-xs text-zinc-400">
                      Title
                      <input
                        className="input mt-2"
                        value={release.title}
                        onChange={e => setRelease({
                          ...release,
                          title: e.target.value,
                        })}
                        required
                      />
                    </label>

                    <label className="text-xs text-zinc-400">
                      URL slug
                      <input
                        className="input mt-2"
                        value={release.slug}
                        onChange={e => setRelease({
                          ...release,
                          slug: e.target.value,
                        })}
                        placeholder="track-name"
                        required
                      />
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="text-xs text-zinc-400">
                      Type
                      <select
                        className="input mt-2"
                        value={release.release_type}
                        onChange={e => setRelease({
                          ...release,
                          release_type: e.target.value,
                        })}
                      >
                        <option value="single">Single</option>
                        <option value="ep">EP</option>
                        <option value="album">Album</option>
                      </select>
                    </label>

                    <label className="text-xs text-zinc-400">
                      Status
                      <select
                        className="input mt-2"
                        value={release.status}
                        onChange={e => setRelease({
                          ...release,
                          status: e.target.value,
                        })}
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="released">Released</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="text-xs text-zinc-400">
                      Release date & time
                      <input
                        className="input mt-2"
                        type="datetime-local"
                        value={release.release_date ? release.release_date.slice(0, 16) : ''}
                        onChange={e => setRelease({
                          ...release,
                          release_date: e.target.value,
                        })}
                        required
                      />
                    </label>

                    <label className="text-xs text-zinc-400">
                      Timezone (IANA)
                      <input
                        className="input mt-2"
                        value={release.timezone}
                        onChange={e => setRelease({
                          ...release,
                          timezone: e.target.value,
                        })}
                        placeholder="Europe/Berlin"
                      />
                    </label>
                  </div>

                  <label className="text-xs text-zinc-400 block">
                    Description
                    <textarea
                      className="input mt-2 min-h-24"
                      value={release.description}
                      onChange={e => setRelease({
                        ...release,
                        description: e.target.value,
                      })}
                    />
                  </label>

                  {fileField(
                    'Cover artwork',
                    'cover_url',
                    release.cover_url,
                    v => setRelease({ ...release, cover_url: v })
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    {(['spotify_url', 'soundcloud_url', 'youtube_url'] as const).map(k => (
                      <label key={k} className="text-xs text-zinc-400">
                        {k.replace('_url', '').toUpperCase()} URL
                        <input
                          className="input mt-2"
                          value={release[k]}
                          onChange={e => setRelease({
                            ...release,
                            [k]: e.target.value,
                          })}
                        />
                      </label>
                    ))}
                  </div>

                  <label className="text-xs text-zinc-400 block">
                    Coming soon label
                    <input
                      className="input mt-2"
                      value={release.coming_soon_label}
                      onChange={e => setRelease({
                        ...release,
                        coming_soon_label: e.target.value,
                      })}
                    />
                  </label>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!release.countdown_enabled}
                      onChange={e => setRelease({
                        ...release,
                        countdown_enabled: e.target.checked,
                      })}
                    />
                    <span className="text-xs text-zinc-400">
                      Enable countdown
                    </span>
                  </div>

                  <label className="text-xs text-zinc-400 block">
                    Sort order
                    <input
                      className="input mt-2"
                      type="number"
                      value={release.sort_order}
                      onChange={e => setRelease({
                        ...release,
                        sort_order: e.target.value,
                      })}
                    />
                  </label>

                  <div className="flex gap-2">
                    <button disabled={busy} className="btn">
                      {busy ? 'Saving...' : 'Save release'}
                    </button>

                    {editRelease && (
                      <button
                        type="button"
                        className="btn btn-dark"
                        onClick={() => {
                          setRelease(blankRelease);
                          setEditRelease(null);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="space-y-3">
                <div className="eyebrow">Published / scheduled</div>

                {releases.map(x => (
                  <div
                    key={x.id}
                    className="admin-card flex gap-4 items-center"
                  >
                    <div className="w-16 h-16 bg-zinc-800 shrink-0">
                      {x.cover_url && (
                        <img
                          src={x.cover_url}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-bold">{x.title}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        {x.type} · {x.status} · {new Date(x.release_at).toLocaleString()}
                      </div>
                    </div>

                    <button
                      className="text-xs text-zinc-300"
                      onClick={() => {
                        setRelease({
                          ...x,
                          release_type: String(x.type || 'single').toLowerCase(),
                          release_date: localInZone(
                            x.release_at,
                            x.release_timezone || 'Asia/Tehran'
                          ),
                          timezone: x.release_timezone || 'Asia/Tehran',
                        });
                        setEditRelease(x.id);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="text-xs text-red-400"
                      onClick={() => remove('releases', x.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'pages' && (
            <div className="grid xl:grid-cols-2 gap-6">
              <div className="admin-card">
                <div className="eyebrow mb-2">Page builder</div>

                <h2 className="display text-4xl mb-6">
                  {editPage ? 'EDIT PAGE' : 'CREATE PAGE'}
                </h2>

                <form onSubmit={savePage} className="space-y-4">
                  <label className="text-xs text-zinc-400 block">
                    Page title
                    <input
                      className="input mt-2"
                      value={page.title}
                      onChange={e => setPage({
                        ...page,
                        title: e.target.value,
                      })}
                      required
                    />
                  </label>

                  <label className="text-xs text-zinc-400 block">
                    URL slug
                    <input
                      className="input mt-2"
                      value={page.slug}
                      onChange={e => setPage({
                        ...page,
                        slug: e.target.value,
                      })}
                      placeholder="about-me"
                      required
                    />
                  </label>

                  <label className="text-xs text-zinc-400 block">
                    Layout
                    <select
                      className="input mt-2"
                      value={page.layout || 'standard'}
                      onChange={e => setPage({
                        ...page,
                        layout: e.target.value,
                      })}
                    >
                      <option value="standard">Standard / narrow reading</option>
                      <option value="wide">Wide / editorial</option>
                      <option value="split">Split layout</option>
                      <option value="immersive">Immersive / full-bleed</option>
                    </select>
                  </label>

                  <label className="text-xs text-zinc-400 block">
                    Content
                    <textarea
                      className="input mt-2 min-h-56"
                      value={page.content}
                      onChange={e => setPage({
                        ...page,
                        content: e.target.value,
                      })}
                    />
                  </label>

                  {fileField(
                    'Hero image',
                    'hero_image',
                    page.hero_image,
                    v => setPage({ ...page, hero_image: v })
                  )}

                  <label className="flex gap-3 items-center text-xs text-zinc-400">
                    <input
                      type="checkbox"
                      checked={!!page.published}
                      onChange={e => setPage({
                        ...page,
                        published: e.target.checked,
                      })}
                    />
                    Published (adds to navigation)
                  </label>

                  <label className="text-xs text-zinc-400 block">
                    Navigation order
                    <input
                      className="input mt-2"
                      type="number"
                      value={page.sort_order}
                      onChange={e => setPage({
                        ...page,
                        sort_order: e.target.value,
                      })}
                    />
                  </label>

                  <div className="flex gap-2">
                    <button className="btn">Save page</button>

                    {editPage && (
                      <button
                        type="button"
                        className="btn btn-dark"
                        onClick={() => {
                          setPage(blankPage);
                          setEditPage(null);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="space-y-3">
                <div className="eyebrow">Your pages</div>

                {pages.map(x => (
                  <div
                    key={x.id}
                    className="admin-card flex items-center gap-3"
                  >
                    <div className="flex-1">
                      <div>{x.title}</div>
                      <div className="text-[10px] text-zinc-500">
                        /{x.slug} · {x.is_published ? 'Published' : 'Draft'}
                      </div>
                    </div>

                    <button
                      className="text-xs"
                      onClick={() => {
                        setPage({
                          ...x,
                          hero_image: x.hero_image_url || '',
                          published: !!x.is_published,
                        });
                        setEditPage(x.id);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="text-xs text-red-400"
                      onClick={() => remove('pages', x.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <form
              onSubmit={saveSettings}
              className="admin-card max-w-3xl space-y-5"
            >
              <div className="eyebrow">
                Artist profile & global links
              </div>

              <h2 className="display text-4xl">SITE IDENTITY</h2>

              <label className="text-xs text-zinc-400 block">
                Artist name
                <input
                  className="input mt-2"
                  value={settings.site_name || 'RED HOOD'}
                  onChange={e => setSettings({
                    ...settings,
                    site_name: e.target.value,
                  })}
                />
              </label>

              <label className="text-xs text-zinc-400 block">
                Biography
                <textarea
                  className="input mt-2 min-h-28"
                  value={settings.bio || ''}
                  onChange={e => setSettings({
                    ...settings,
                    bio: e.target.value,
                  })}
                />
              </label>

              {fileField(
                'Artist profile image',
                'profile_image',
                settings.profile_image || '',
                v => setSettings({
                  ...settings,
                  profile_image: v || null,
                }),
                true
              )}

              {fileField(
                'Website logo',
                'logo_url',
                settings.logo_url || '',
                v => setSettings({
                  ...settings,
                  logo_url: v,
                })
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {(['spotify_url', 'soundcloud_url', 'instagram_url', 'youtube_url'] as const).map(k => (
                  <label key={k} className="text-xs text-zinc-400">
                    {k.replace('_url', '').toUpperCase()} URL
                    <input
                      className="input mt-2"
                      value={settings[k] || ''}
                      onChange={e => setSettings({
                        ...settings,
                        [k]: e.target.value,
                      })}
                    />
                  </label>
                ))}
              </div>

              <label className="text-xs text-zinc-400 block">
                Featured release
                <select
                  className="input mt-2"
                  value={settings.featured_release_id || ''}
                  onChange={e => setSettings({
                    ...settings,
                    featured_release_id: e.target.value || null,
                  })}
                >
                  <option value="">Auto / latest release</option>
                  {releases.map(x => (
                    <option key={x.id} value={x.id}>
                      {x.title}
                    </option>
                  ))}
                </select>
              </label>

              <button className="btn" disabled={busy}>
                {busy ? 'Saving...' : 'Save site settings'}
              </button>
            </form>
          )}

          {tab === 'background' && (
            <form
              onSubmit={saveBackground}
              className="admin-card max-w-3xl space-y-5"
            >
              <div className="eyebrow">Visual management</div>
              <h2 className="display text-4xl">BACKGROUND MANAGER</h2>
              <p className="text-sm leading-6 text-zinc-400">
                Upload and save a background image for a future website update.
                This is stored as a draft only; it will not change the live website yet.
              </p>

              {fileField(
                'Background image',
                'background_image_url',
                backgroundImage,
                setBackgroundImage,
                true
              )}

              <div className="border border-zinc-800 p-4 text-xs leading-6 text-zinc-500">
                CURRENT STATUS: DRAFT ONLY. The existing website background,
                colors, layout, and visual design remain untouched.
              </div>

              <button className="btn" disabled={busy}>
                {busy ? 'Saving...' : 'Save background draft'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
