'use client';

import { useAuthContext } from '@/features/auth/contexts/AuthContext';
import { ComponentProps, MouseEventHandler, useTransition } from 'react';
import { Button } from '../../../components/ui/button';

type SignoutButtonProps = ComponentProps<typeof Button>;

const SignoutButton = ({ onClick, disabled, ...props }: SignoutButtonProps) => {
  const { signout } = useAuthContext();

  const [pending, startTransition] = useTransition();

  const isDisabled = pending || disabled;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);

    if (!e.isDefaultPrevented() || !isDisabled)
      startTransition(() => {
        signout();
      });
  };
  return (
    <Button
      variant="destructive"
      {...props}
      disabled={isDisabled}
      onClick={handleClick}
    >
      Sign out
    </Button>
  );
};

export default SignoutButton;
