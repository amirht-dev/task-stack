import Toast from '@/components/Toast';
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
      const toastId = toast.custom(
        () => <Toast variant="loading" title="Signing out..." />,
        {
          id: 'signout',
        }
      );

      return { toastId };
    },
    onSuccess(_, __, onMutateResult, context) {
      toast.custom(
        () => <Toast variant="success" title="Signed out successfully" />,
        {
          id: onMutateResult?.toastId,
        }
      );

      context.client.invalidateQueries({
        queryKey: getAuthQueryOptions().queryKey,
      });
    },
    onError(error, _, onMutateResult) {
      toast.custom(
        () => (
          <Toast
            variant="destructive"
            title="Failed to signout"
            description={error.message}
          />
        ),
        {
          id: onMutateResult?.toastId,
        }
      );
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
