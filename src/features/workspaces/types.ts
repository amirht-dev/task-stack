import { DiscriminatedResponseWithData } from '@/types/utils';
import { UseQueryResult } from '@tanstack/react-query';
import type { Models } from 'node-appwrite';
import { Merge, Simplify } from 'type-fest';
import { DatabaseProject } from '../projects/types';
import { getWorkspaceAction } from './actions';
import useWorkspacesQuery from './hooks/useWorkspacesQuery';

export type DatabaseWorkspace = Merge<
  Models.Row,
  {
    name: string;
    userId: string;
    imageId: string | null;
    teamId: string;
    projects: DatabaseProject[];
  }
>;

export type ResponseWorkspaces = Merge<
  Simplify<Pick<DatabaseWorkspace, '$id' | 'imageId' | 'name' | 'teamId'>>,
  {
    image: { id: string; blob: Blob } | null;
    user: {
      roles: string[];
    };
    totalMembers: number;
  }
>[];

export type Workspaces = ReturnType<
  typeof useWorkspacesQuery
> extends UseQueryResult<infer T>
  ? T
  : never;

export type ResponseWorkspace = Merge<
  DatabaseWorkspace,
  Pick<ResponseWorkspaces[number], 'image' | 'totalMembers' | 'user'> & {
    owner: { id: string; name: string };
  }
>;

// export type WorkspacesList = Awaited<
//   ReturnType<typeof getWorkspacesAction>
// > extends DiscriminatedResponseWithData<infer TData>
//   ? TData extends Models.RowList<infer T>
//     ? T[]
//     : unknown
//   : unknown;

export type Workspace = Awaited<
  ReturnType<typeof getWorkspaceAction>
> extends DiscriminatedResponseWithData<infer TData>
  ? TData
  : unknown;
