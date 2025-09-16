import { Models } from 'appwrite';
import { Reducer, useReducer } from 'react';

export type AuthState = {
  user: Models.User<Models.Preferences> | null;
  state: 'authenticated' | 'pending' | 'unauthenticated';
};

export type AuthAction =
  | {
      type: 'SIGNING_IN' | 'SIGNOUT' | 'REFRESHING';
    }
  | {
      type: 'SIGNED_IN';
      payload: { user: Models.User<Models.Preferences> };
    };

const reducer: Reducer<AuthState, AuthAction> = (state, action) => {
  switch (action.type) {
    case 'SIGNING_IN':
      return {
        state: 'pending',
        user: null,
      };
    case 'SIGNED_IN':
      return {
        state: 'authenticated',
        user: action.payload.user,
      };
    case 'SIGNOUT':
      return {
        state: 'unauthenticated',
        user: null,
      };
    case 'REFRESHING':
      return {
        state: 'pending',
        user: state.user,
      };
    default:
      return state;
  }
};

function useAuthState() {
  return useReducer(reducer, {
    state: 'pending',
    user: null,
  });
}

export default useAuthState;
