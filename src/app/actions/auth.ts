'use server';

import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { rateLimitCheck, getClientIP, formatRateLimitError } from '@/lib/rate-limit';

// --- Types ---
export interface ActionState {
  error?: string;
  success?: string;
}

// --- Validation Schemas ---
const emailSchema = z.string().email('Geçerli bir e-posta adresi giriniz.').toLowerCase().trim();

const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalıdır.')
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir.')
  .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir.')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir.')
  .regex(/[^A-Za-z0-9]/, 'Şifre en az bir özel karakter içermelidir.');

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre gereklidir.'),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token gereklidir.'),
  password: passwordSchema,
});

// --- Helper Functions ---
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

// --- Actions ---

export async function registerAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawEmail = formData.get('email');
  const rawPassword = formData.get('password');

  // Validate inputs
  const result = registerSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(' ');
    return { error: errors };
  }

  const { email, password } = result.data;

  const ip = await getClientIP();
  const limit = await rateLimitCheck(`register:${ip}:${email}`, 3, 300000);
  if (!limit.success) {
    return { error: formatRateLimitError(limit.resetInSeconds) };
  }

  try {
    const existing = await db.select().from(users).where(eq(users.email, email)).get();
    if (existing) {
      // Generic error to prevent user enumeration
      return { error: 'Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin veya giriş yapmayı deneyin.' };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
    }).returning();

    await createSession(newUser.id);
  } catch (error) {
    console.error('Register Error:', error);
    return { error: 'Kayıt işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.' };
  }

  redirect('/dashboard');
}

export async function loginAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawEmail = formData.get('email');
  const rawPassword = formData.get('password');

  const result = loginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(' ');
    return { error: errors };
  }

  const { email, password } = result.data;

  const ip = await getClientIP();
  const limit = await rateLimitCheck(`login:${ip}:${email}`, 5, 300000);
  if (!limit.success) {
    return { error: formatRateLimitError(limit.resetInSeconds) };
  }

  try {
    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      // Generic error to prevent user enumeration
      return { error: 'E-posta adresi veya şifre hatalı.' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { error: 'E-posta adresi veya şifre hatalı.' };
    }

    await createSession(user.id);
  } catch (error) {
    console.error('Login Error:', error);
    return { error: 'Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' };
  }

  redirect('/dashboard');
}

export async function forgotPasswordAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawEmail = formData.get('email');

  const result = forgotPasswordSchema.safeParse({
    email: rawEmail,
  });

  if (!result.success) {
    return { error: 'Geçerli bir e-posta adresi giriniz.' };
  }

  const { email } = result.data;

  const ip = await getClientIP();
  const limit = await rateLimitCheck(`forgot:${ip}:${email}`, 3, 3600000);
  if (!limit.success) {
    return { error: formatRateLimitError(limit.resetInSeconds) };
  }

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  
  if (!user) {
    // Return generic success to prevent email enumeration
    return { success: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' };
  }

  try {
    // Generate cryptographically secure token
    const token = generateSecureToken();
    const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour

    // Invalidate any existing unused tokens for this user
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
      usedAt: null,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Password reset link: http://localhost:3000/reset-password?token=${token}`);
    }

    return { success: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' };
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return { error: 'İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.' };
  }
}

export async function resetPasswordAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawToken = formData.get('token');
  const rawPassword = formData.get('password');

  const result = resetPasswordSchema.safeParse({
    token: rawToken,
    password: rawPassword,
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => e.message).join(' ');
    return { error: errors };
  }

  const { token, password } = result.data;

  const ip = await getClientIP();
  const limit = await rateLimitCheck(`reset:${ip}:${token}`, 3, 300000);
  if (!limit.success) {
    return { error: formatRateLimitError(limit.resetInSeconds) };
  }

  try {
    const resetToken = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .get();

    if (!resetToken) {
      return { error: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.' };
    }

    if (resetToken.usedAt) {
      return { error: 'Bu bağlantı daha önce kullanılmış. Lütfen yeni bir şifre sıfırlama talebinde bulunun.' };
    }

    if (resetToken.expiresAt < Date.now()) {
      return { error: 'Şifre sıfırlama bağlantısının süresi dolmuş. Lütfen yeni bir talep oluşturun.' };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, resetToken.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: Date.now() })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Optional: create session automatically
    // await createSession(resetToken.userId);
  } catch (error) {
    console.error('Reset Password Error:', error);
    return { error: 'Şifre sıfırlanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' };
  }

  redirect('/login');
}
