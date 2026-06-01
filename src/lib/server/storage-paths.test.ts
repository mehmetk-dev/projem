import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPublicStorageUrl,
  createStorageFileName,
  normalizeStorageFolder,
  toStorageObjectKey,
} from './storage-paths';

test('normalizeStorageFolder keeps uploads inside a single safe folder path', () => {
  assert.equal(normalizeStorageFolder(' blog '), 'blog');
  assert.equal(normalizeStorageFolder('../not'), 'not');
  assert.equal(normalizeStorageFolder('gunluk/fotograflar'), 'gunluk/fotograflar');
});

test('toStorageObjectKey combines safe folder and filename without traversal', () => {
  assert.equal(toStorageObjectKey('proje', 'image.jpg'), 'proje/image.jpg');
  assert.equal(toStorageObjectKey('/blog/', '../cover.png'), 'blog/cover.png');
});

test('createStorageFileName preserves allowed image extensions with a unique suffix', () => {
  const fileName = createStorageFileName('.jpg', () => 'uuid', () => 1779000000000);

  assert.equal(fileName, '1779000000000-uuid.jpg');
});

test('buildPublicStorageUrl prefers public base URL and encodes path segments', () => {
  const url = buildPublicStorageUrl({
    endpoint: 'https://example.r2.cloudflarestorage.com',
    bucket: 'projem',
    objectKey: 'blog/my image.jpg',
    publicBaseUrl: 'https://cdn.example.com/assets/',
  });

  assert.equal(url, 'https://cdn.example.com/assets/blog/my%20image.jpg');
});

test('buildPublicStorageUrl falls back to internal media route', () => {
  const url = buildPublicStorageUrl({
    endpoint: 'https://example.r2.cloudflarestorage.com/',
    bucket: 'projem',
    objectKey: 'not/photo.webp',
  });

  assert.equal(url, '/api/media/not/photo.webp');
});
