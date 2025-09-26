import { DiscriminatedResponseWithData } from '@/types/utils';
import type { Models } from 'node-appwrite';
import { getWorkspacesAction } from './actions';

export type DatabaseWorkspace = Models.Row & {
  name: string;
  userId: string;
  imageId: string | null;
  teamId: string;
};

export type ResponseWorkspaces = Awaited<
  ReturnType<typeof getWorkspacesAction>
> extends DiscriminatedResponseWithData<infer TData>
  ? TData
  : unknown;
