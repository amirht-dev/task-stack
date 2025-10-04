'use client';

import {
  SectionCard,
  SectionCardContent,
  SectionCardFooter,
  SectionCardFormActionButton,
  SectionCardHeader,
  SectionCardRow,
  SectionCardTitle,
} from '@/components/SectionCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/input';
import useAuth, { getAuthQueryOptions } from '@/features/auth/hooks/useAuth';
import { UpdateProfileEmailFormSchema } from '@/features/auth/schemas';
import {
  sendEmailVerificationAction,
  updateProfileEmailAction,
} from '@/features/profile/actions';
import { navItem } from '@/features/profile/constants';
import sonner from '@/utils/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

function UpdateProfileEmailSection() {
  const queryClient = useQueryClient();
  const { user, isAuthenticating, isAuthenticated } = useAuth();
  const form = useForm({
    values: { email: user?.email ?? '', password: '' },
    resolver: zodResolver(UpdateProfileEmailFormSchema),
    disabled: isAuthenticating,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const id = sonner.loading({
      title: 'Updating email...',
      toastData: {
        id: 'update-email',
      },
    });

    const res = await updateProfileEmailAction(data);
    sonner.success({
      title: 'Email is updated',
      toastData: {
        id,
      },
    });
    if (res.success) {
      queryClient.invalidateQueries({
        queryKey: getAuthQueryOptions().queryKey,
      });
    } else {
      sonner.error({
        title: 'Failed to update Email',
        description: res.error.message,
        toastData: {
          id,
        },
      });
    }
  });

  const handleVerify = async () => {
    const id = sonner.loading({
      title: 'Sending Email verification...',
      description: undefined,
      toastData: {
        id: 'email-verify',
      },
    });

    const res = await sendEmailVerificationAction();

    if (res.success)
      sonner.success({
        title: 'Verification email has sent to your email address',
        description: undefined,
        toastData: {
          id,
        },
      });
    else
      sonner.error({
        title: 'Failed to send verification email',
        description: res.error.message,
        toastData: {
          id,
        },
      });
  };

  return (
    <SectionCard id={navItem.email.id} key={navItem.email.id}>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <SectionCardRow>
            <SectionCardHeader>
              <SectionCardTitle className="items-center flex gap-2">
                {navItem.email.label}{' '}
                {isAuthenticated && (
                  <Badge
                    variant={user?.emailVerification ? 'success' : 'warning'}
                    appearance="outline"
                  >
                    {user?.emailVerification ? 'verified' : 'unverified'}
                  </Badge>
                )}
              </SectionCardTitle>
            </SectionCardHeader>

            <SectionCardContent>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="Email Address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          placeholder="Enter Password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SectionCardContent>
          </SectionCardRow>
          <SectionCardFooter className="gap-2">
            <SectionCardFormActionButton />
            {isAuthenticated && !user?.emailVerification && (
              <Button variant="outline" type="button" onClick={handleVerify}>
                Verify
              </Button>
            )}
          </SectionCardFooter>
        </form>
      </Form>
    </SectionCard>
  );
}

export default UpdateProfileEmailSection;
