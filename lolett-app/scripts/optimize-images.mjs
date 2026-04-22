import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'public/images');
const MAX_WIDTH = 1600;
const QUALITY = 82;
const MIN_SIZE_TO_PROCESS = 500 * 1024;
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && EXTS.has(path.extname(entry.name).toLowerCase())) yield full;
  }
}

async function processImage(filePath) {
  const stat = await fs.stat(filePath);
  if (stat.size < MIN_SIZE_TO_PROCESS) return { skipped: true };

  const ext = path.extname(filePath).toLowerCase();
  const meta = await sharp(filePath).metadata();

  let pipeline = sharp(filePath, { failOn: 'none' });
  if ((meta.width ?? 0) > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
  } else if (ext === '.png') {
    pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: QUALITY });
  }

  const buffer = await pipeline.toBuffer();
  if (buffer.length < stat.size) {
    await fs.writeFile(filePath, buffer);
    return { before: stat.size, after: buffer.length };
  }
  return { skipped: true };
}

async function main() {
  let totalBefore = 0, totalAfter = 0, processed = 0, skipped = 0, errors = 0;
  for await (const abs of walk(ROOT)) {
    const rel = path.relative(ROOT, abs);
    try {
      const result = await processImage(abs);
      if (result.skipped) { skipped++; continue; }
      totalBefore += result.before;
      totalAfter += result.after;
      processed++;
      console.log(`✓ ${rel}: ${(result.before / 1024).toFixed(0)}KB → ${(result.after / 1024).toFixed(0)}KB`);
    } catch (err) {
      errors++;
      console.error(`✗ ${rel}: ${err.message}`);
    }
  }
  console.log(`\n📊 ${processed} processed, ${skipped} skipped, ${errors} errors`);
  console.log(`   ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB (gain ${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
