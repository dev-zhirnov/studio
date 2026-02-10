import { NextRequest, NextResponse } from 'next/server';
import { readFile, access, constants } from 'fs/promises';
import path from 'path';

async function findUploadsDir(): Promise<string | null> {
  const candidates = [
    process.env.UPLOAD_DIR,
    '/tmp/uploads',
    path.join(process.cwd(), 'uploads'),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    try {
      await access(dir, constants.R_OK);
      console.log('[FILES] Found readable dir:', dir);
      return dir;
    } catch {
      console.log('[FILES] Cannot read dir:', dir);
    }
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    console.log('[FILES] Requested filename:', filename);
    console.log('[FILES] cwd:', process.cwd());
    
    const uploadsDir = await findUploadsDir();
    if (!uploadsDir) {
      console.log('[FILES] No uploads directory found');
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    console.log('[FILES] uploadsDir:', uploadsDir);
    const filePath = path.join(uploadsDir, filename);
    console.log('[FILES] Full path:', filePath);
    
    const file = await readFile(filePath);
    console.log('[FILES] File found, size:', file.length);
    
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.rtf': 'application/rtf',
    };
    
    return new Response(file, {
      headers: {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': file.length.toString(),
      },
    });
  } catch (error) {
    console.error('[FILES] Error:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
