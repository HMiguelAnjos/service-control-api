import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: string;
  sizeBytes: number;
}

const MAX_ORIGINAL_DIMENSION = 1600;
const ORIGINAL_QUALITY = 82;
const THUMB_DIMENSION = 400;
const THUMB_QUALITY = 75;

export async function processOriginal(input: Buffer): Promise<ProcessedImage> {
  const buffer = await sharp(input)
    .rotate()
    .resize({
      width: MAX_ORIGINAL_DIMENSION,
      height: MAX_ORIGINAL_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: ORIGINAL_QUALITY, progressive: true, mozjpeg: true })
    .toBuffer();

  const meta = await sharp(buffer).metadata();
  return {
    buffer,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    mimeType: 'image/jpeg',
    sizeBytes: buffer.length,
  };
}

export async function processThumbnail(input: Buffer): Promise<ProcessedImage> {
  const buffer = await sharp(input)
    .rotate()
    .resize({ width: THUMB_DIMENSION, height: THUMB_DIMENSION, fit: 'cover' })
    .jpeg({ quality: THUMB_QUALITY, progressive: true, mozjpeg: true })
    .toBuffer();

  const meta = await sharp(buffer).metadata();
  return {
    buffer,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    mimeType: 'image/jpeg',
    sizeBytes: buffer.length,
  };
}
