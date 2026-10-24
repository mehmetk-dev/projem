import type { Metadata } from 'next';
import ResetPasswordForm, { InvalidTokenState } from '@/components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Şifre sıfırla | Mehmet Kerem',
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return <InvalidTokenState />;
  }

  return <ResetPasswordForm token={token} />;
}
