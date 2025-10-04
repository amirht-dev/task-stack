'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scrollspy } from '@/components/ui/scrollspy';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '@/features/auth/hooks/useAuth';
import UpdateProfileAvatarSection from '@/features/profile/components/UpdateProfileAvatarSection';
import UpdateProfileEmailSection from '@/features/profile/components/UpdateProfileEmailSection';
import UpdateProfileNameSection from '@/features/profile/components/UpdateProfileNameSection';
import UpdateProfilePasswordSection from '@/features/profile/components/UpdateProfilePasswordSection';
import { navItem } from '@/features/profile/constants';
import useIsTablet from '@/hooks/useIsTablet';
import { useRef, useState } from 'react';

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
          <UpdateProfileNameSection />
          <UpdateProfileEmailSection />
          <UpdateProfilePasswordSection />
          <UpdateProfileAvatarSection />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfilePage;
