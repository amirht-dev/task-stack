import { oauthGetURLAction, oauthSigninAction } from '@/actions/auth.action';
import { openPopup } from '@/utils/client';
import { oauthSchema } from '@/utils/schemas';
import { OAuthProvider } from 'appwrite';
import { useEffect } from 'react';

function useOAuthPopup({
  popupName = 'OAuth',
  onStart,
  onSuccess,
  onError,
}: {
  popupName?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const login = async (providerId: OAuthProvider) => {
    onStart?.();
    const res = await oauthGetURLAction(providerId);

    if (res.success)
      openPopup(res.data, popupName, { width: 700, height: 700 });
    else onError?.(res.error);
  };

  useEffect(() => {
    const messageListener = async (e: MessageEvent) => {
      if (
        e.origin !== window.location.origin ||
        (e.source as Window).name !== popupName
      )
        return;

      const result = oauthSchema.safeParse(e.data);

      if (result.success) {
        const res = await oauthSigninAction(result.data);
        if (res.success) onSuccess?.();
        else onError?.(res.error);
      }
    };

    window.addEventListener('message', messageListener);

    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [popupName, onStart, onSuccess, onError]);

  return login;
}

export default useOAuthPopup;
