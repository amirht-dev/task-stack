import { signoutAction } from '@/actions/auth.action';
import { Button } from '@/components/ui/button';
import { getLoggedInUser } from '@/lib/appwrite/server';
import Link from 'next/link';

export default async function Home() {
  const user = await getLoggedInUser();

  return (
    <div>
      {user ? (
        <form action={signoutAction}>
          <Button type="submit">signout</Button>
        </form>
      ) : (
        <Button asChild>
          <Link href="/sign-in">signin</Link>
        </Button>
      )}
    </div>
  );
}
