'use client';

import { providers } from '@/features/auth/constants';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { PropsWithComponentPropsWithRef } from '@/types/utils';
import { ArrayValues, Except } from 'type-fest';
import { Button } from '../../../components/ui/button';

const OAuthProviders = () => {
  return (
    <div className="flex gap-4">
      {providers.map((provider) => (
        <OAuthButton className="flex-1" {...provider} key={provider.id} />
      ))}
    </div>
  );
};

export default OAuthProviders;

type OAuthButtonProps = Except<
  PropsWithComponentPropsWithRef<typeof Button, ArrayValues<typeof providers>>,
  'children'
>;

const OAuthButton = ({ icon: Icon, id, ...props }: OAuthButtonProps) => {
  const { oauthSignIn } = useAuthContext();
  return (
    <Button
      variant="outline"
      size="lg"
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.isDefaultPrevented() && !props.disabled) {
          oauthSignIn(id);
        }
      }}
    >
      <Icon className="size-6" />
    </Button>
  );
};
