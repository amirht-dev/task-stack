import Toast from '@/components/Toast';
import { requestPopupData } from '@/utils/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OAuthProvider } from 'appwrite';
import { toast } from 'sonner';
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
      const toastId = toast.custom(
        () => <Toast variant="loading" title="Signing in..." />,
        {
          id: 'signin',
        }
      );
      return { toastId };
    },
    onSuccess(_, __, onMutateResult) {
      toast.custom(
        () => <Toast variant="success" title="Signed in successfully" />,
        {
          id: onMutateResult?.toastId,
        }
      );

      queryClient.invalidateQueries({
        queryKey: getAuthQueryOptions().queryKey,
      });
    },
    onError(error, _, onMutateResult) {
      toast.custom(
        () => (
          <Toast
            variant="destructive"
            title="Failed to sign in"
            description={error.message}
          />
        ),
        {
          id: onMutateResult?.toastId,
          description: error.message,
        }
      );
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
