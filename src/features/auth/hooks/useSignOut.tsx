import sonner from '@/utils/toast';
import { useMutation } from '@tanstack/react-query';
import { signoutAction } from '../actions';
import { getAuthQueryOptions } from './useAuth';

function useSignOut() {
  const {
    mutate: signOut,
    isPending: isSigningOut,
    isSuccess: isSignedOut,
    isError: isFailedToSignOut,
    status: signoutStatus,
    ...rest
  } = useMutation({
    mutationKey: ['signout'],
    mutationFn: async () => {
      const res = await signoutAction();
      if (!res.success) throw new Error(res.error.message);
    },
    onMutate() {
      const toastId = sonner.loading({
        title: 'Signing out...',
        toastData: {
          id: 'signout',
        },
      });

      return { toastId };
    },
    onSuccess(_, __, onMutateResult, context) {
      sonner.success({
        title: 'Signed out successfully',
        toastData: {
          id: onMutateResult?.toastId,
        },
      });

      context.client.invalidateQueries({
        queryKey: getAuthQueryOptions().queryKey,
      });
    },
    onError(error, _, onMutateResult) {
      sonner.error({
        title: 'Failed to signout',
        description: error.message,
        toastData: {
          id: onMutateResult?.toastId,
        },
      });
    },
  });

  return {
    signOut,
    isSigningOut,
    isSignedOut,
    isFailedToSignOut,
    signoutStatus,
    ...rest,
  };
}

export default useSignOut;
