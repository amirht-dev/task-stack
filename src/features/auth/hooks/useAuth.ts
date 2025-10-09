import { queryOptions, useQuery } from '@tanstack/react-query';
import { getCurrentUserAction } from '../actions';
import { User } from '../types';

export function getAuthQueryOptions() {
  return queryOptions({
    queryKey: ['user'],
    queryFn: async (): Promise<User> => {
      const res = await getCurrentUserAction();
      if (res.success)
        return {
          ...res.data,
          profile: {
            ...res.data.profile,
            avatarImageUrl: res.data.profile.avatarImageBlob
              ? URL.createObjectURL(res.data.profile.avatarImageBlob)
              : '/images/default_user_avatar.png',
          },
        };
      else throw new Error(res.error.message);
    },
    staleTime: 60 * 1000,
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
