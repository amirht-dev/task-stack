'use client';

import { providers } from '@/features/auth/constants';
import { PropsWithComponentPropsWithRef } from '@/types/utils';
import { ArrayValues, Except } from 'type-fest';
import { Button } from '../../../components/ui/button';
import useSignIn from '../hooks/useSignIn';

const OAuthProviders = () => {
  const { signIn } = useSignIn();

  return (
    <div className="flex gap-4">
      {providers.map((provider) => (
        <OAuthButton
          className="flex-1"
          onClick={() => signIn({ method: 'OAuth', data: provider.id })}
          {...provider}
          key={provider.id}
        />
      ))}
    </div>
  );
};

export default OAuthProviders;

type OAuthButtonProps = Except<
  PropsWithComponentPropsWithRef<typeof Button, ArrayValues<typeof providers>>,
  'children'
>;

const OAuthButton = ({ icon: Icon, ...props }: OAuthButtonProps) => {
  return (
    <Button variant="outline" size="lg" {...props}>
      <Icon className="size-6" />
    </Button>
  );
};
