'use client';

import Toast from '@/components/Toast';
import { verifyEmailVerificationAction } from '@/features/auth/actions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const VerifyEmail = () => {
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URL(location.href).searchParams;

    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (!userId || !secret) return;

    const verifyEmail = async () => {
      const id = toast.custom(
        () => <Toast variant="loading" title="Verifying email address..." />,
        {
          id: 'verify-email',
        }
      );
      const res = await verifyEmailVerificationAction(userId, secret);
      if (res.success) {
        toast.custom(
          () => <Toast variant="success" title="Email address verified" />,
          { id }
        );
        router.replace('/profile#email-address');
      } else {
        toast.custom(
          () => (
            <Toast
              variant="destructive"
              title="Failed to verify email address"
              description={res.error.message}
            />
          ),
          {
            id,
          }
        );
      }
    };

    verifyEmail();
  }, [router]);

  return null;
};

export default VerifyEmail;
