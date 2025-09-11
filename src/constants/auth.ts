export const AUTHENTICATED_REDIRECT_PARAM_KEY = 'redirectTo';

import { OAuthProvider } from 'appwrite';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { IconType } from 'react-icons/lib';
import { ArrayValues } from 'type-fest';

export const providers = [
  {
    name: 'google',
    id: OAuthProvider.Google,
    icon: FcGoogle,
  },
  {
    name: 'github',
    id: OAuthProvider.Github,
    icon: FaGithub,
  },
] as const satisfies { name: string; id: string; icon: IconType }[];

export type Provider = ArrayValues<typeof providers>['name'];
