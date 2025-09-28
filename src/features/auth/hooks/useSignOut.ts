import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
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
      const toastId = toast.loading('Signing out...', {
        id: 'signout',
        description: undefined,
      });

      return { toastId };
    },
    onSuccess(_, __, onMutateResult, context) {
      toast.success('Signed out successfully', {
        id: onMutateResult?.toastId,
        description: undefined,
      });

      context.client.invalidateQueries({
        queryKey: getAuthQueryOptions().queryKey,
      });
    },
    onError(error, _, onMutateResult) {
      toast.error('Failed to signout', {
        id: onMutateResult?.toastId,
        description: error.message,
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
