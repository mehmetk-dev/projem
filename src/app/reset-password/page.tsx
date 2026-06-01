import ResetPasswordForm, { InvalidTokenState } from '@/components/ResetPasswordForm';

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
