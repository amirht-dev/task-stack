import { oauthGetURLAction, oauthSigninAction } from '@/actions/auth.action';
import { openPopup } from '@/utils/client';
import { oauthSchema } from '@/utils/schemas';
import { OAuthProvider } from 'appwrite';
import { useEffect } from 'react';

function useOAuthPopup({
  popupName = 'OAuth',
  onStart,
  onSuccess,
  onFailed,
}: {
  popupName?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onFailed?: () => void;
}) {
  const login = async (providerId: OAuthProvider) => {
    onStart?.();
    const url = await oauthGetURLAction(providerId);

    openPopup(url, popupName, { width: 700, height: 700 });
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
        else onFailed?.();
      }
    };

    window.addEventListener('message', messageListener);

    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [popupName, onStart, onSuccess, onFailed]);

  return login;
}

export default useOAuthPopup;
