'use client';

import { OAuthSignin } from '@/actions/auth.action';
import { AUTHENTICATED_REDIRECT_PARAM_KEY, providers } from '@/constants/auth';
import { PropsWithComponentPropsWithRef } from '@/types/utils';
import { OAuthProvider } from 'appwrite';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { ArrayValues, Except } from 'type-fest';
import { Button } from './ui/button';

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
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const handleOAuthSignin = (provider: OAuthProvider) => {
    startTransition(() => {
      OAuthSignin(provider, {
        redirectTo:
          searchParams.get(AUTHENTICATED_REDIRECT_PARAM_KEY) ?? undefined,
      });
    });
  };

  return (
    <Button
      variant="outline"
      size="lg"
      {...props}
      disabled={props.disabled || pending}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.isDefaultPrevented() && !props.disabled)
          startTransition(() => handleOAuthSignin(id));
      }}
    >
      <Icon className="size-6" />
    </Button>
  );
};
