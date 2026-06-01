import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { buildPublicStorageUrl, toStorageObjectKey } from './storage-paths';

let cachedClient: S3Client | null = null;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for R2 uploads.`);
  }
  return value;
}

function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const accountId = requireEnv('R2_ACCOUNT_ID');
  const endpoint = process.env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`;

  cachedClient = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    },
  });

  return cachedClient;
}

export async function uploadImageBufferToR2(options: {
  buffer: Buffer;
  folder: string;
  fileName: string;
  contentType: string;
}): Promise<string> {
  const bucket = requireEnv('R2_BUCKET');
  const endpoint = process.env.R2_ENDPOINT?.trim() || `https://${requireEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;
  const objectKey = toStorageObjectKey(options.folder, options.fileName);

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: options.buffer,
      ContentType: options.contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return buildPublicStorageUrl({
    endpoint,
    bucket,
    objectKey,
    publicBaseUrl: process.env.R2_PUBLIC_URL,
  });
}

export async function getR2Object(objectKey: string) {
  return getR2Client().send(
    new GetObjectCommand({
      Bucket: requireEnv('R2_BUCKET'),
      Key: objectKey,
    }),
  );
}

export interface R2ObjectInfo {
  key: string;
  size: number;
  lastModified: string;
  contentType?: string;
}

export async function listR2Objects(prefix: string): Promise<R2ObjectInfo[]> {
  const bucket = requireEnv('R2_BUCKET');
  const result = await getR2Client().send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: 500,
    }),
  );

  return (result.Contents || [])
    .filter((obj) => obj.Key && !obj.Key.endsWith('/'))
    .map((obj) => ({
      key: obj.Key!,
      size: obj.Size ?? 0,
      lastModified: obj.LastModified?.toISOString() ?? '',
    }));
}

export async function deleteR2Object(objectKey: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: requireEnv('R2_BUCKET'),
      Key: objectKey,
    }),
  );
}
