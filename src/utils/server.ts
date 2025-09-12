import { SESSION_COOKIE_KEY } from '@/constants/auth';
import {
  DiscriminatedResponse,
  DiscriminatedResponseWithData,
} from '@/types/utils';
import { cookies } from 'next/headers';
import { Models } from 'node-appwrite';
import 'server-only';
import { Promisable } from 'type-fest';

export async function setSessionCookie(session: Models.Session) {
  (await cookies()).set(SESSION_COOKIE_KEY, session.secret, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(session.expire),
  });
}

export async function handleResponse(
  cb: () => Promisable<void>
): Promise<DiscriminatedResponse>;
export async function handleResponse<T>(
  cb: () => Promisable<T>
): Promise<DiscriminatedResponseWithData<T>>;
export async function handleResponse(
  cb: () => unknown
): Promise<DiscriminatedResponse | DiscriminatedResponseWithData<unknown>> {
  try {
    const data = await cb();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'something wrong happened please try again later',
    };
  }
}
