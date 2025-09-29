import { Models } from 'node-appwrite';

export type DatabaseProfile = Models.Row & {
  avatarImageId: string | null;
  userId: string;
};
