'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';

type SetPasswordAlertDialogProps = {
  onCancel?: () => void;
  onAccept?: () => void;
};

const SetPasswordAlertDialog = ({
  onCancel,
  onAccept,
}: SetPasswordAlertDialogProps) => {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleAccept = () => {
    router.push('/profile#password');
    onAccept?.();
  };

  useEffect(() => {
    if (isAuthenticated && user?.targets.length === 0 && !user.passwordUpdate) {
      setOpen(true);

      const listener = (e: BeforeUnloadEvent) => {
        setOpen(true);
        e.preventDefault();
      };

      window.addEventListener('beforeunload', listener);

      return () => {
        window.removeEventListener('beforeunload', listener);
      };
    }
  }, [isAuthenticated, user]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Missing Sign in Information</AlertDialogTitle>
          <AlertDialogDescription>
            you have not set password and if you do not have oauth accounts
            associated with your email, you may not able to sign in back to your
            account. for better security set password for your account.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>
              Ask Me Later
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept}>
              Set Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SetPasswordAlertDialog;
