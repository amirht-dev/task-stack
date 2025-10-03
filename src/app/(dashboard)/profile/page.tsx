'use client';

import ImageInput from '@/components/ImageInput';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scrollspy } from '@/components/ui/scrollspy';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  sendEmailVerificationAction,
  updateProfileAvatarAction,
  updateProfileEmailAction,
  updateProfileNameAction,
  updateProfilePasswordAction,
} from '@/features/auth/actions';
import useAuth, { getAuthQueryOptions } from '@/features/auth/hooks/useAuth';
import {
  UpdateProfileAvatarFormSchema,
  UpdateProfileEmailFormSchema,
  UpdateProfileNameFormSchema,
  UpdateProfilePasswordFormSchema,
} from '@/features/auth/schemas';
import { FileWithPreview } from '@/hooks/useFileUpload';
import useIsTablet from '@/hooks/useIsTablet';
import sonner from '@/utils/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const navItem = {
  name: { id: 'name', label: 'Name' },
  email: { id: 'email-address', label: 'Email Address' },
  password: {
    id: 'password',
    label: 'Password',
  },
  avatar: {
    id: 'avatar',
    label: 'Avatar',
  },
};

const ProfilePage = () => {
  const { user, isAuthenticating, isAuthenticated } = useAuth();
  const parentRef = useRef<HTMLDivElement>(null);
  const [id, setId] = useState<string>();
  const isTablet = useIsTablet();

  return (
    <div className="h-full flex flex-col">
      <div className="profile-cover h-[120px] lg:h-[200px] shrink-0" />

      <div className="flex flex-col items-start sm:items-center sm:flex-row gap-4 sm:gap-8 shrink-0 container">
        <div className="size-25 sm:size-30 lg:size-40 -mt-10 bg-background rounded-full">
          {isAuthenticating ? (
            <Skeleton
              size="box"
              className="size-full rounded-full bg-neutral-200 dark:bg-neutral-800"
            />
          ) : (
            isAuthenticated && (
              <Avatar className="size-full ring-3 ring-background rounded-full">
                <AvatarImage
                  src={user?.profile.avatarImageUrl}
                  alt={user?.name}
                />
                <AvatarFallback className="text-xl sm:text-2xl lg:text-4xl bg-background">
                  AT
                </AvatarFallback>
              </Avatar>
            )
          )}
        </div>

        <div className="flex flex-col gap-1 lg:gap-2">
          <span className="text-2xl lg:text-3xl font-normal">
            <Skeleton
              loading={isAuthenticating}
              className="w-60 bg-neutral-200 dark:bg-neutral-800"
              size="text"
            >
              {user?.name}
            </Skeleton>
          </span>
          <span className="text-base lg:text-lg font-normal text-muted-foreground">
            <Skeleton
              loading={isAuthenticating}
              size="text"
              className="w-50 bg-neutral-200 dark:bg-neutral-800"
            >
              {user?.email}
            </Skeleton>
          </span>
        </div>
      </div>

      <div className="container">
        <Tabs
          className="mt-10 max-w-fit mx-0 shrink-0"
          value={id}
          onValueChange={setId}
        >
          <TabsList size={isTablet ? 'md' : 'sm'}>
            <Scrollspy targetRef={parentRef} offset={5} onUpdate={setId}>
              {Object.values(navItem).map((item) => (
                <TabsTrigger
                  value={item.id}
                  key={item.id}
                  data-scrollspy-anchor={item.id}
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </Scrollspy>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea
        className="flex-1 mt-4 overflow-y-auto"
        viewportRef={parentRef}
      >
        <div className="container space-y-8 pb-8">
          <UpdateNameSection />
          <UpdateEmailSection />
          <UpdatePasswordSection />
          <UpdateAvatarSection />
        </div>
      </ScrollArea>
    </div>
  );
};

function UpdateNameSection() {
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

function UpdateEmailSection() {
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
    const res = await sendEmailVerificationAction();

    const id = 'email-verify';

    if (res.success)
      toast.success('Verification email has sent to your email address', {
        id,
        description: undefined,
      });
    else
      toast.error('Failed to send verification email', {
        id,
        description: res.error.message,
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

function UpdatePasswordSection() {
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

function UpdateAvatarSection() {
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

export default ProfilePage;
