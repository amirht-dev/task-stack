'use client';

import ImageInput from '@/components/ImageInput';
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
import useAuth, { getAuthQueryOptions } from '@/features/auth/hooks/useAuth';
import { UpdateProfileAvatarFormSchema } from '@/features/auth/schemas';
import { updateProfileAvatarAction } from '@/features/profile/actions';
import { navItem } from '@/features/profile/constants';
import { FileWithPreview } from '@/hooks/useFileUpload';
import sonner from '@/utils/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

function UpdateProfileAvatarSection() {
  const queryClient = useQueryClient();
  const { isAuthenticating, isAuthenticated, user } = useAuth();
  const [file, setFile] = useState<FileWithPreview>();
  const form = useForm<UpdateProfileAvatarFormSchema>({
    resolver: zodResolver(UpdateProfileAvatarFormSchema),
    disabled: isAuthenticating,
  });

  const handleSubmit = form.handleSubmit(async ({ image }) => {
    const id = sonner.loading({
      title: 'Updating avatar...',
      toastData: {
        id: 'update-avatar',
      },
    });
    const res = await updateProfileAvatarAction(image);

    if (res.success) {
      sonner.success({
        title: 'Avatar is updated',
        toastData: {
          id,
        },
      });
      queryClient.invalidateQueries({
        queryKey: getAuthQueryOptions().queryKey,
      });
      form.reset();
      setFile(undefined);
    } else {
      sonner.error({
        title: 'Failed to update avatar',
        description: res.error.message,
        toastData: {
          id,
        },
      });
    }
  });

  useEffect(() => {
    const { avatarImageBlob, avatarImageUrl } = user?.profile ?? {};
    if (!user || file || !avatarImageBlob || !avatarImageUrl) return;

    setFile({
      file: new File([avatarImageBlob], 'avatar', {
        type: avatarImageBlob.type,
      }),
      id: 'avatar',
      preview: avatarImageUrl,
    });
  }, [isAuthenticated, file, user]);

  return (
    <SectionCard id={navItem.avatar.id} key={navItem.avatar.id}>
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <SectionCardRow>
            <SectionCardHeader>
              <SectionCardTitle>{navItem.avatar.label}</SectionCardTitle>
            </SectionCardHeader>

            <SectionCardContent>
              <FormField
                control={form.control}
                name="image"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <ImageInput
                        {...field}
                        file={file}
                        onFileChange={(file) => {
                          setFile(file);

                          if (!(file?.file instanceof File)) return;

                          form.setValue('image', file.file, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        onError={(error) => {
                          error.forEach((err) => {
                            form.setError('image', { message: err });
                          });
                        }}
                      />
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

export default UpdateProfileAvatarSection;
