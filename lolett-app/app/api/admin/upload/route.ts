import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

// Supported file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Extract file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const extensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
  };
  return extensionMap[mimeType] || 'bin';
}

/**
 * Sanitize filename: remove special characters, keep alphanumeric and common separators
 */
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100); // Limit to 100 chars
}

export async function POST(request: Request) {
  try {
    // Check admin authentication
    if (!(await checkAdminCookieFromRequest(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          allowed: 'Images (JPEG, PNG, WebP, AVIF, GIF) or Videos (MP4, WebM, MOV)',
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 50MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    // Prepare file path with timestamp and original filename
    const timestamp = Date.now();
    const sanitizedOriginalName = sanitizeFilename(
      file.name.replace(/\.[^.]*$/, '') // Remove existing extension
    );

    // Convert images (except GIF to preserve animation) to optimized WebP
    const shouldConvert =
      ALLOWED_IMAGE_TYPES.includes(file.type) && file.type !== 'image/gif';

    let finalBuffer: Buffer | Uint8Array;
    let finalMimeType = file.type;
    let finalExt = getFileExtension(file.type);

    if (shouldConvert) {
      const input = Buffer.from(await file.arrayBuffer());
      finalBuffer = await sharp(input)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      finalMimeType = 'image/webp';
      finalExt = 'webp';
    } else {
      finalBuffer = new Uint8Array(await file.arrayBuffer());
    }

    const fileName = `${timestamp}-${sanitizedOriginalName}.${finalExt}`;
    const filePath = `media/${fileName}`;

    // Upload to Supabase Storage
    const supabase = createAdminClient();
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, finalBuffer, {
        contentType: finalMimeType,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // Construct public URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${filePath}`;

    return NextResponse.json(
      {
        success: true,
        fileName,
        filePath: `media/${fileName}`,
        url: publicUrl,
        type: ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video',
        mimeType: finalMimeType,
        size: finalBuffer.byteLength,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during upload' },
      { status: 500 }
    );
  }
}
