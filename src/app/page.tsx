'use client';

import { SignIn, SigningIn, SignOut } from '@/components/Auth';
import { Button } from '@/components/ui/button';
import { AUTHENTICATED_REDIRECT_PARAM_KEY } from '@/constants/auth';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { signout } = useAuthContext();
  const router = useRouter();

  return (
    <div>
      <SignIn>
        <Button onClick={signout}>sign out</Button>
      </SignIn>

      <SigningIn>loading...</SigningIn>

      <SignOut>
        <Button
          onClick={() =>
            router.push(
              `/sign-in?${new URLSearchParams({
                [AUTHENTICATED_REDIRECT_PARAM_KEY]: location.href,
              }).toString()}`
            )
          }
        >
          sign in
        </Button>
      </SignOut>
    </div>
  );
}
