import { DiscriminatedResponseWithData } from '@/types/utils';
import type { Models } from 'node-appwrite';
import { getWorkspaceAction, getWorkspacesAction } from './actions';

export type DatabaseWorkspace = Models.Row & {
  name: string;
  userId: string;
  imageId: string | null;
  teamId: string;
};

export type WorkspacesList = Awaited<
  ReturnType<typeof getWorkspacesAction>
> extends DiscriminatedResponseWithData<infer TData>
  ? TData extends Models.RowList<infer T>
    ? T[]
    : unknown
  : unknown;

export type Workspace = Awaited<
  ReturnType<typeof getWorkspaceAction>
> extends DiscriminatedResponseWithData<infer TData>
  ? TData
  : unknown;
