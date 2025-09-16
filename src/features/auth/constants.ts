import { OAuthProvider } from 'appwrite';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { IconType } from 'react-icons/lib';
import { ArrayValues } from 'type-fest';

export const AUTHENTICATED_REDIRECT_PARAM_KEY = 'redirectTo';

export const SESSION_COOKIE_KEY = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

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
