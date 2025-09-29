import { UnwrapDiscriminatedResponseData } from '@/types/utils';
import { Models } from 'node-appwrite';
import { MergeDeep } from 'type-fest';
import { getCurrentUserAction } from './actions';

export type DatabaseProfile = Models.Row & {
  avatarImageId: string | null;
  userId: string;
};

export type ResponseUser = UnwrapDiscriminatedResponseData<
  typeof getCurrentUserAction
>;

export type User = MergeDeep<
  ResponseUser,
  { profile: { avatarImageUrl: string } }
>;
