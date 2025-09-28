import { queryOptions, useQuery } from '@tanstack/react-query';
import { getCurrentUserAction } from '../actions';

export function getAuthQueryOptions() {
  return queryOptions({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await getCurrentUserAction();
      if (res.success) return res.data;
      else throw new Error(res.error.message);
    },
  });
}

function useAuth() {
  const {
    data: user,
    status,
    isLoading: isAuthenticating,
    isSuccess: isAuthenticated,
    isError: isUnauthenticated,
    fetchStatus: userStatus,
    isFetching: isFetchingUser,
    isFetched: isFetchedUser,
    isPaused: isFetchingUserPaused,
    refetch: refetchUser,
    ...restQuery
  } = useQuery(getAuthQueryOptions());

  const authStatus =
    status === 'pending'
      ? ('authenticating' as const)
      : status === 'success'
      ? ('authenticated' as const)
      : ('unauthenticated' as const);

  return {
    user,
    status: authStatus,
    isAuthenticating,
    isAuthenticated,
    isUnauthenticated,
    userStatus,
    isFetchingUser,
    isFetchedUser,
    isFetchingUserPaused,
    refetchUser,
    ...restQuery,
  };
}

export default useAuth;
