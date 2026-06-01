import assert from 'node:assert/strict';
import test from 'node:test';
import { formatPlayedAt, formatRelativePlayedAt, mapSpotifyRecentItems } from './history';

test('formatRelativePlayedAt returns Turkish relative labels', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');

  assert.equal(formatRelativePlayedAt('2026-05-16T11:59:30.000Z', now), 'az önce');
  assert.equal(formatRelativePlayedAt('2026-05-16T11:15:00.000Z', now), '45 dakika önce');
  assert.equal(formatRelativePlayedAt('2026-05-16T10:45:00.000Z', now), '1 saat önce');
  assert.equal(formatRelativePlayedAt('2026-05-15T10:00:00.000Z', now), '1 gün önce');
});

test('formatPlayedAt formats exact Turkish date and time', () => {
  assert.equal(formatPlayedAt('2026-05-16T09:30:00.000Z'), '16 May 2026, 12:30');
});

test('mapSpotifyRecentItems extracts track, cover and played date', () => {
  const result = mapSpotifyRecentItems({
    items: [
      {
        played_at: '2026-05-16T11:00:00.000Z',
        track: {
          id: 'abc123',
          name: 'Song',
          artists: [{ name: 'Artist 1' }, { name: 'Artist 2' }],
          album: {
            name: 'Album',
            images: [{ url: 'https://i.scdn.co/image/large' }, { url: 'https://i.scdn.co/image/small' }],
          },
          external_urls: { spotify: 'https://open.spotify.com/track/abc123' },
        },
      },
    ],
  });

  assert.deepEqual(result, [
    {
      spotifyTrackId: 'abc123',
      track: 'Song',
      artist: 'Artist 1, Artist 2',
      album: 'Album',
      albumImageUrl: 'https://i.scdn.co/image/large',
      trackUrl: 'https://open.spotify.com/track/abc123',
      playedAt: '2026-05-16T11:00:00.000Z',
    },
  ]);
});
