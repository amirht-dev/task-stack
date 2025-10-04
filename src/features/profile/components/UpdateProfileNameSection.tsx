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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/input';
import useAuth, { getAuthQueryOptions } from '@/features/auth/hooks/useAuth';
import { UpdateProfileNameFormSchema } from '@/features/auth/schemas';
import sonner from '@/utils/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { updateProfileNameAction } from '../actions';
import { navItem } from '../constants';

function UpdateProfileNameSection() {
  const queryClient = useQueryClient();
  const { user, isAuthenticating } = useAuth();
  const form = useForm({
    values: { name: user?.name ?? '' },
    resolver: zodResolver(UpdateProfileNameFormSchema),
    disabled: isAuthenticating,
  });

  const handleSubmit = form.handleSubmit(async ({ name }) => {
    const id = sonner.loading({
      title: 'Updating name...',
      toastData: {
        id: 'update-name',
      },
    });
    const res = await updateProfileNameAction(name);

    if (res.success) {
      sonner.success({
        title: 'Name updated',
        toastData: {
          id,
          description: undefined,
        },
      });
      queryClient.invalidateQueries({
        queryKey: getAuthQueryOptions().queryKey,
      });
    } else {
      sonner.error({
        title: 'Failed to update name',
        toastData: {
          id,
          description: res.error.message,
        },
      });
    }
  });

  return (
    <SectionCard id={navItem.name.id} key={navItem.name.id}>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <SectionCardRow>
            <SectionCardHeader>
              <SectionCardTitle>{navItem.name.label}</SectionCardTitle>
            </SectionCardHeader>

            <SectionCardContent>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default UpdateProfileNameSection;
