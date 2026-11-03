# RED HOOD — Official Artist Website

A full-stack Next.js artist site with a public-facing catalog, upcoming-release countdowns, dynamic pages, and a private admin dashboard.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS + Framer Motion-ready styling
- Supabase PostgreSQL, Auth, Row Level Security, and Storage

## 1. Requirements
- Node.js 20.9+
- A Supabase project

## 2. Configure Supabase
1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. In **Authentication → Users**, create an admin user with email/password.
4. Add the same email to the database allowlist:
   ```sql
   insert into public.app_admins(email) values ('you@example.com') on conflict do nothing;
   ```
5. Copy the Project URL and anon key from **Project Settings → API**.

The admin is checked in three places: Next.js middleware, every admin API route, and database RLS. Do not expose the Supabase service-role key to the browser; this project does not need it.

## 3. Environment
Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
ADMIN_EMAILS=you@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`ADMIN_EMAILS` supports comma-separated email addresses. Keep it server-side; do not prefix it with `NEXT_PUBLIC_`.

## 4. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Admin: http://localhost:3000/admin/login.

## Features
- Editable artist name, bio, portrait, logo, and social links
- Release CRUD with Single / EP / Album, cover upload, platform links, ordering, and featured release
- Upcoming releases with per-release countdown toggle, label, exact time, and IANA timezone
- Multiple simultaneous countdowns; client countdown updates every second
- Dynamic page creation, publishing, navigation insertion, and deletion
- Public release cards link to Spotify, SoundCloud, and YouTube
- Private admin dashboard and authenticated media upload (8 MB image limit)
- SEO metadata and responsive dark visual system

## Countdown auto-publishing
The public countdown switches to listening links as soon as its target time passes. Each catalog read also calls a narrowly scoped database function that persists due `upcoming` releases as `released`. For unattended updates even when nobody visits the site, enable **pg_cron** in Supabase Database → Extensions and run the commented `cron.schedule` statement at the bottom of `supabase/schema.sql` once; it runs every minute. The admin can also manually change status at any time.

## Timezone note
Enter the release date/time in the admin form as local clock time for the selected IANA timezone (for example `Europe/Berlin` or `Asia/Tehran`). The app converts that wall-clock time to UTC for storage; countdowns use the stored absolute timestamp, so visitors in every timezone see the same release moment.

## Production deployment
Deploy to Vercel or another Node hosting provider. Add the same environment variables in the hosting dashboard and set `NEXT_PUBLIC_SITE_URL` to the production domain. Add your production domain to Supabase Auth → URL Configuration → Site URL and Redirect URLs. Connect a custom domain and enable HTTPS.

## Security / operational notes
- Admin access requires both the configured email allowlist and a valid Supabase Auth session.
- Database writes are additionally restricted by `public.is_site_admin()` and `app_admins` RLS policy.
- The storage bucket is public-read for public artwork URLs; uploads/updates/deletes require authenticated access and are routed through the server-side admin check.
- Keep admin credentials private and enable MFA in Supabase Auth for production.
- For a larger CMS (rich text blocks, drag-and-drop page layouts, audit logs, multiple roles), extend the `pages` schema and dashboard editor.
