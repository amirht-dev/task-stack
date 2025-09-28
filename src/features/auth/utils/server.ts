import { getLoggedInUser } from '@/lib/appwrite/server';
import { Models } from 'appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_KEY } from '../constants';

export async function setSessionCookie(session: Models.Session) {
  const cookie = await cookies();
  cookie.set(SESSION_COOKIE_KEY, session.secret, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(session.expire),
  });
}

export async function protect() {
  const user = await getLoggedInUser();

  if (!user) redirect('/sign-in');
}
