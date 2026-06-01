import 'dotenv/config';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { uploadImageBufferToR2 } from '../src/lib/server/r2-storage';

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);

function keyFromPublicUrl(url: string): string {
  if (url.startsWith('/api/media/')) {
    return url.slice('/api/media/'.length);
  }
  const pathname = new URL(url).pathname.split('/').filter(Boolean);
  const bucket = process.env.R2_BUCKET || '';
  const bucketIndex = pathname.indexOf(bucket);
  return bucketIndex >= 0 ? pathname.slice(bucketIndex + 1).join('/') : pathname.slice(-2).join('/');
}

async function main() {
  const url = await uploadImageBufferToR2({
    buffer: onePixelPng,
    folder: 'blog',
    fileName: `codex-r2-${Date.now()}.png`,
    contentType: 'image/png',
  });

  const key = keyFromPublicUrl(url);
  const client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });

  await client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));

  console.log(JSON.stringify({ ok: true, folder: 'blog', key, url, deleted: true }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
