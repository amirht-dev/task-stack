import SignUpCard from '@/components/SignUpCard';
import { getLoggedInUser } from '@/lib/appwrite/server';
import { redirect } from 'next/navigation';

const SignUp = async () => {
  const user = await getLoggedInUser();

  if (user) redirect('/');

  return <SignUpCard />;
};

export default SignUp;
