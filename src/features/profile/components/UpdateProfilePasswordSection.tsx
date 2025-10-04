'use client';

import {
  SectionCard,
  SectionCardContent,
  SectionCardDescription,
  SectionCardFooter,
  SectionCardFormActionButton,
  SectionCardHeader,
  SectionCardRow,
  SectionCardTitle,
} from '@/components/SectionCard';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/input';
import useAuth, { getAuthQueryOptions } from '@/features/auth/hooks/useAuth';
import { UpdateProfilePasswordFormSchema } from '@/features/auth/schemas';
import { updateProfilePasswordAction } from '@/features/profile/actions';
import { navItem } from '@/features/profile/constants';
import sonner from '@/utils/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

function UpdateProfilePasswordSection() {
  const queryClient = useQueryClient();
  const { isAuthenticating } = useAuth();
  const form = useForm({
    values: { oldPassword: '', password: '' },
    resolver: zodResolver(UpdateProfilePasswordFormSchema),
    disabled: isAuthenticating,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const id = sonner.loading({
      title: 'Updating password...',
      toastData: {
        id: 'update-password',
      },
    });
    const res = await updateProfilePasswordAction(data);

    if (res.success) {
      sonner.success({
        title: 'Password is updated',
        toastData: {
          id,
        },
      });
      queryClient.invalidateQueries({
        queryKey: getAuthQueryOptions().queryKey,
      });
      form.reset();
    } else {
      sonner.error({
        title: 'Failed to update password',
        description: res.error.message,
        toastData: {
          id,
        },
      });
    }
  });

  return (
    <SectionCard id={navItem.password.id} key={navItem.password.id}>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <SectionCardRow>
            <SectionCardHeader>
              <SectionCardTitle>{navItem.password.label}</SectionCardTitle>
              <SectionCardDescription>
                old password is optional if you signed in with providers
              </SectionCardDescription>
            </SectionCardHeader>

            <SectionCardContent>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          placeholder="Old Password"
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
                          placeholder="New Password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SectionCardContent>
          </SectionCardRow>
          <SectionCardFooter>
            <SectionCardFormActionButton />
          </SectionCardFooter>
        </form>
      </Form>
    </SectionCard>
  );
}

export default UpdateProfilePasswordSection;
