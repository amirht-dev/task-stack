'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const OAuthCallback = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    (window.opener as Window)?.postMessage({ userId, secret }, location.origin);
  }, [searchParams]);

  return 'loading...';
};

export default OAuthCallback;
