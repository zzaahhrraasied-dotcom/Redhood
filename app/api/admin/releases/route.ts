import {NextResponse} from 'next/server';
import {adminDb,fail} from '@/lib/admin';

function normalizeRelease(body:Record<string,any>) {
  return {
    ...body,
    ...(typeof body.slug==='string' ? {slug:body.slug.trim()} : {}),
  };
}

export async function GET() {
  try {
    const db=await adminDb();
    const {data,error}=await db.from('releases').select('*').order('sort_order');
    if(error)throw error;
    return NextResponse.json(data);
  } catch(e) {
    return fail(e);
  }
}

export async function POST(req:Request) {
  try {
    const db=await adminDb();
    const body=normalizeRelease(await req.json());
    const {data,error}=await db.from('releases').insert(body).select().single();
    if(error)throw error;
    return NextResponse.json(data);
  } catch(e) {
    return fail(e);
  }
}

export async function PATCH(req:Request) {
  try {
    const db=await adminDb();
    const {id,...rawBody}=await req.json();
    const body=normalizeRelease(rawBody);
    const {data,error}=await db.from('releases').update(body).eq('id',id).select().single();
    if(error)throw error;
    return NextResponse.json(data);
  } catch(e) {
    return fail(e);
  }
}

export async function DELETE(req:Request) {
  try {
    const db=await adminDb();
    const {id}=await req.json();
    const {error}=await db.from('releases').delete().eq('id',id);
    if(error)throw error;
    return NextResponse.json({ok:true});
  } catch(e) {
    return fail(e);
  }
}
