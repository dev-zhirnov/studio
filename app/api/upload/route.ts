import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access, constants } from 'fs/promises';
import path from 'path';

async function getWritableUploadsDir(): Promise<string> {
  const candidates = [
    process.env.UPLOAD_DIR,
    '/tmp/uploads',
    path.join(process.cwd(), 'uploads'),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    try {
      await access(dir, constants.W_OK);
      console.log('[UPLOAD] Using existing writable dir:', dir);
      return dir;
    } catch {
      try {
        await mkdir(dir, { recursive: true });
        console.log('[UPLOAD] Created and using dir:', dir);
        return dir;
      } catch (e) {
        console.log('[UPLOAD] Cannot use dir:', dir, e);
      }
    }
  }

  throw new Error('No writable upload directory found');
}

export async function POST(request: NextRequest) {
  console.log('[UPLOAD] Starting upload...');
  console.log('[UPLOAD] process.cwd():', process.cwd());
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('[UPLOAD] formData keys:', Array.from(formData.keys()));
    console.log('[UPLOAD] file:', file);
    console.log('[UPLOAD] file name:', file?.name);
    console.log('[UPLOAD] file size:', file?.size);
    console.log('[UPLOAD] file type:', file?.type);

    if (!file) {
      console.log('[UPLOAD] No file in formData');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = await getWritableUploadsDir();
    console.log('[UPLOAD] uploadsDir:', uploadsDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `upload-${timestamp}-${safeFilename}`;
    const filePath = path.join(uploadsDir, filename);
    console.log('[UPLOAD] filePath:', filePath);

    await writeFile(filePath, buffer);
    console.log('[UPLOAD] File written successfully');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zhirnov.studio';
    
    return NextResponse.json({
      success: true,
      path: `${siteUrl}/api/files/${filename}`,
      originalName: file.name
    });
  } catch (error) {
    console.error('[UPLOAD] Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
