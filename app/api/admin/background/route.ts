import { NextResponse } from 'next/server';
import { adminDb, fail } from '@/lib/admin';

export async function PATCH(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();

    if (!body || typeof body.background_image_url !== 'string') {
      return NextResponse.json(
        { error: 'A background image URL is required.' },
        { status: 400 }
      );
    }

    const rawUrl = body.background_image_url.trim();
    let backgroundImageUrl: string | null = null;

    if (rawUrl) {
      const imageUrl = new URL(rawUrl);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (
        imageUrl.protocol !== 'https:' ||
        !supabaseUrl ||
        imageUrl.origin !== new URL(supabaseUrl).origin ||
        !imageUrl.pathname.startsWith('/storage/v1/object/public/artist-media/')
      ) {
        return NextResponse.json(
          { error: 'Upload the background image to the artist-media storage bucket first.' },
          { status: 400 }
        );
      }

      backgroundImageUrl = imageUrl.toString();
    }

    const { data, error } = await db
      .from('site_settings')
      .update({
        background_image_url: backgroundImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select('background_image_url')
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (e) {
    return fail(e);
  }
}
