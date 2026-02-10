import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const revalidateSecret = process.env.REVALIDATE_SECRET;

  if (!revalidateSecret || secret !== revalidateSecret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { post_id, post_type } = body;

    if (post_type === 'post' || !post_type) {
      revalidatePath('/');
      revalidatePath(`/projects/${post_id}`);
      return NextResponse.json({ revalidated: true, paths: ['/', `/projects/${post_id}`] });
    }

    return NextResponse.json({ revalidated: false, message: 'Post type not tracked' });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: String(err) }, { status: 500 });
  }
}
