'use client';

import { use, useEffect } from 'react';

const OAuthCallback = ({ searchParams }: PageProps<'/oauth/callback'>) => {
  const { userId, secret } = use(searchParams);

  useEffect(() => {
    if (!userId || !secret) return;

    (window.opener as Window)?.postMessage(
      {
        userId: Array.isArray(userId) ? userId[0] : userId,
        secret: Array.isArray(secret) ? secret[0] : secret,
      },
      location.origin
    );
  }, [userId, secret]);

  return 'loading...';
};

export default OAuthCallback;
