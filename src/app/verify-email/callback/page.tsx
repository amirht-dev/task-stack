'use client';

import { verifyEmailVerificationAction } from '@/features/profile/actions';
import sonner from '@/utils/toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const VerifyEmail = () => {
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URL(location.href).searchParams;

    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (!userId || !secret) return;

    const verifyEmail = async () => {
      const id = sonner.loading({
        title: 'Verifying email address...',
        toastData: {
          id: 'verify-email',
        },
      });

      const res = await verifyEmailVerificationAction(userId, secret);
      if (res.success) {
        sonner.success({
          title: 'Email address verified',
          toastData: {
            id,
          },
        });
        router.replace('/profile#email-address');
      } else {
        sonner.error({
          title: 'Failed to verify email address',
          description: res.error.message,
          toastData: {
            id,
          },
        });
      }
    };

    verifyEmail();
  }, [router]);

  return null;
};

export default VerifyEmail;
