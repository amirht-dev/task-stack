import type { Models } from 'node-appwrite';

export type Workspace = Models.Row & {
  name: string;
  userId: string;
  imageId: string | null;
};

export type WorkspaceWithImageBlob = Workspace & {
  imageBlob: Blob | null;
};

export type WorkspaceWithImageUrl = Workspace & {
  imageUrl: string | null;
};
