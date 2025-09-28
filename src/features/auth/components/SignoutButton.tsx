'use client';

import { ComponentProps, MouseEventHandler } from 'react';
import { Button } from '../../../components/ui/button';
import useSignOut from '../hooks/useSignOut';

type SignoutButtonProps = ComponentProps<typeof Button>;

const SignoutButton = ({ onClick, disabled, ...props }: SignoutButtonProps) => {
  const { signOut, isSigningOut } = useSignOut();

  const isDisabled = isSigningOut || disabled;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    if (!e.isDefaultPrevented() || !isDisabled) signOut();
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
