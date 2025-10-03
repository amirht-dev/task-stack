import { requestPopupData } from '@/utils/client';
import sonner from '@/utils/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OAuthProvider } from 'appwrite';
import {
  emailPasswordSigninAction,
  oauthGetURLAction,
  oauthSigninAction,
} from '../actions';
import { oauthSchema, SignInSchemaType } from '../schemas';
import { getAuthQueryOptions } from './useAuth';

type SignInData =
  | {
      method: 'credentials';
      data: SignInSchemaType;
    }
  | {
      method: 'OAuth';
      data: OAuthProvider;
    };

function useSignIn() {
  const queryClient = useQueryClient();

  const {
    mutate: signIn,
    isSuccess: isSignedIn,
    isPending: isSigningIn,
    isError: isFailedToSignIn,
    isPaused: isSignInPaused,
    status: signInStatus,
  } = useMutation({
    mutationKey: ['signin'],
    mutationFn: async ({ method, data }: SignInData) => {
      if (method === 'credentials') {
        const res = await emailPasswordSigninAction(data);
        if (!res.success) throw new Error(res.error.message);
      } else {
        const oauthUrlRes = await oauthGetURLAction(data);
        if (!oauthUrlRes.success) throw new Error(oauthUrlRes.error.message);
        const popupData = oauthSchema.parse(
          await requestPopupData(oauthUrlRes.data, 'OAuth', {
            width: 700,
            height: 700,
          })
        );

        const signInRes = await oauthSigninAction(popupData);
        if (!signInRes.success) throw new Error(signInRes.error.message);
      }
    },
    onMutate() {
      const toastId = sonner.loading({
        title: 'Signing in...',
        toastData: {
          id: 'signin',
        },
      });
      return { toastId };
    },
    onSuccess(_, __, onMutateResult) {
      sonner.success({
        title: 'Signed in successfully',
        toastData: {
          id: onMutateResult?.toastId,
        },
      });

      queryClient.invalidateQueries({
        queryKey: getAuthQueryOptions().queryKey,
      });
    },
    onError(error, _, onMutateResult) {
      sonner.error({
        title: 'Failed to sign in',
        description: error.message,
        toastData: {
          id: onMutateResult?.toastId,
        },
      });
    },
  });

  return {
    signIn,
    isSignedIn,
    isSigningIn,
    isFailedToSignIn,
    isSignInPaused,
    signInStatus,
  };
}

export default useSignIn;
