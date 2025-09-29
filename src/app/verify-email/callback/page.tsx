'use client';

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
      const id = toast.loading('Verifying email address', {
        id: 'verify-email',
        description: undefined,
      });
      const res = await verifyEmailVerificationAction(userId, secret);
      if (res.success) {
        toast.success('Email address verified', { id, description: undefined });
        router.replace('/profile#email-address');
      } else {
        toast.error('Failed to verify email address', {
          id,
          description: res.error.message,
        });
      }
    };

    verifyEmail();
  }, [router]);

  return null;
};

export default VerifyEmail;
