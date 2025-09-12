import { SESSION_COOKIE_KEY } from '@/constants/auth';
import { cookies } from 'next/headers';
import { Models } from 'node-appwrite';
import 'server-only';

export async function setSessionCookie(session: Models.Session) {
  (await cookies()).set(SESSION_COOKIE_KEY, session.secret, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(session.expire),
  });
}
