import { AUTHENTICATED_REDIRECT_PARAM_KEY } from '@/features/auth/constants';
import { setSessionCookie } from '@/features/auth/utils/server';
import { createAdminClient } from '@/lib/appwrite/server';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;

  const [userId, secret, redirectTo] = [
    'userId',
    'secret',
    AUTHENTICATED_REDIRECT_PARAM_KEY,
  ].map((key) => searchParams.get(key));

  if (!userId || !secret)
    return NextResponse.json({ error: 'invalid credentials' }, { status: 400 });

  const { account } = await createAdminClient();

  const session = await account.createSession({ userId, secret });

  await setSessionCookie(session);

  return NextResponse.redirect(
    redirectTo ?? process.env.NEXT_PUBLIC_ORIGIN_URL
  );
};
