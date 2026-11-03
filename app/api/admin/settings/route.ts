import {NextResponse} from 'next/server';import {adminDb,fail} from '@/lib/admin';
export async function GET(){try{const db=await adminDb();const {data,error}=await db.from('site_settings').select('*').eq('id',1).single();if(error)throw error;return NextResponse.json(data)}catch(e){return fail(e)}}
export async function PATCH(req:Request){try{const db=await adminDb();const body=await req.json();const {data,error}=await db.from('site_settings').upsert({...body,id:1}).select().single();if(error)throw error;return NextResponse.json(data)}catch(e){return fail(e)}}
