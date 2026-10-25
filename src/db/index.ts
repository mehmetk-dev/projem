import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error('TURSO_DATABASE_URL environment variable is required.');
}

// Build sırasında paralel sayfa üretimi Turso bağlantısını koparabiliyor (fetch failed); ağ hatalarını birkaç kez yeniden dener.
async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit) {
  const attempts = 3;
  for (let i = 1; ; i++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (i >= attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 300 * i));
    }
  }
}

const client = createClient({
  url,
  authToken,
  fetch: fetchWithRetry,
});

export const db = drizzle(client, { schema });
