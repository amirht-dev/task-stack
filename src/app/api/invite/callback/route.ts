import { setSessionCookie } from '@/features/auth/utils/server';
import { InviteMembershipParamsSchema } from '@/features/workspaces/schemas';
import { createAdminClient } from '@/lib/appwrite/server';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { Client, Teams } from 'node-appwrite';

export const GET = async (request: NextRequest) => {
  const parseResult = InviteMembershipParamsSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );

  if (!parseResult.success)
    return NextResponse.json(
      { error: parseResult.error.message },
      { status: 400 }
    );

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

  const teams = new Teams(client);

  try {
    await teams.updateMembershipStatus(parseResult.data);

    const { users } = await createAdminClient();

    const session = await users.createSession({
      userId: parseResult.data.userId,
    });

    await setSessionCookie(session);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'something wrong happened in server',
      },
      { status: 500 }
    );
  }

  redirect(`/workspaces/${parseResult.data.workspaceId}`);
};
