import type { Models } from 'node-appwrite';

export type DatabaseWorkspace = Models.Row & {
  name: string;
  userId: string;
  imageId: string | null;
  teamId: string;
};

export type ResponseWorkspace = DatabaseWorkspace & {
  imageBlob: Blob | null;
  members: Models.MembershipList;
};

export type Workspace = ResponseWorkspace & {
  imageUrl: string | null;
};
