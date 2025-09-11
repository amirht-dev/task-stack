import { cookies } from 'next/headers';
import { Models } from 'node-appwrite';
import 'server-only';

export async function setSessionCookie(session: Models.Session) {
  (await cookies()).set('session', session.secret, {
    sameSite: 'strict',
    expires: new Date(session.expire),
  });
}
