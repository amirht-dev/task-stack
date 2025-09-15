import SignInCard from '@/components/SignInCard';
import { getLoggedInUser } from '@/lib/appwrite/server';
import { redirect } from 'next/navigation';

const SignIn = async () => {
  const user = await getLoggedInUser();

  if (user) redirect('/');

  return <SignInCard />;
};

export default SignIn;
