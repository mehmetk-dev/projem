import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { cache } from 'react';

// --- Configuration ---
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const COOKIE_NAME = 'session';

let _key: Uint8Array | null = null;
function getKey(): Uint8Array {
  if (_key) return _key;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Please set it in your .env file.');
  }
  _key = new TextEncoder().encode(secret);
  return _key;
}

// --- Types ---
export interface SessionPayload {
  userId: number;
  sessionToken: string;
  expires: string; // ISO string for JWT exp
}

// --- Core Crypto Functions ---
export async function encrypt(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getKey());
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, getKey(), {
      algorithms: ['HS256'],
      clockTolerance: 60, // 1 minute clock skew tolerance
    });
    // Validate the payload shape before casting
    const p = payload as unknown as Record<string, unknown>;
    if (
      typeof p.userId === 'number' &&
      typeof p.sessionToken === 'string' &&
      typeof p.expires === 'string'
    ) {
      return {
        userId: p.userId,
        sessionToken: p.sessionToken,
        expires: p.expires,
      };
    }
    return null;
  } catch (error) {
    // Log the specific error type for debugging but don't leak details
    if (error instanceof Error) {
      console.warn(`Session verification failed: ${error.name}`);
    }
    return null;
  }
}

// --- Session Management ---
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createSession(userId: number): Promise<void> {
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const sessionToken = generateSecureToken();
  
  // Create JWT
  const jwt = await encrypt({ 
    userId, 
    sessionToken, 
    expires: expires.toISOString() 
  });

  // Store session in database for server-side invalidation
  await db.insert(sessions).values({
    userId,
    token: sessionToken,
    expiresAt: expires.getTime(),
  });

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  cookieStore.set(COOKIE_NAME, jwt, {
    expires,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    // No need for maxAge when expires is set, but both works fine
  });
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  
  // Server-side invalidate session if it exists
  if (session) {
    const payload = await decrypt(session);
    if (payload?.sessionToken) {
      await db.delete(sessions).where(eq(sessions.token, payload.sessionToken));
    }
  }

  cookieStore.set(COOKIE_NAME, '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export const getSession = cache(async (): Promise<{ userId: number } | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!sessionCookie) return null;

  const payload = await decrypt(sessionCookie);
  if (!payload?.sessionToken || !payload?.userId) return null;

  // Server-side validation: check if session exists and not expired
  const dbSession = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, payload.sessionToken))
    .get();

  if (!dbSession || dbSession.expiresAt < Date.now()) {
    // Session expired or revoked, clear cookie
    cookieStore.set(COOKIE_NAME, '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return null;
  }

  return { userId: payload.userId };
});

// Auth helpers
export const requireAuth = cache(async (): Promise<{ userId: number }> => {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
  return user || null;
});

export const requireAdmin = cache(async (): Promise<{ userId: number; role: string }> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return { userId: user.id, role: user.role };
});
