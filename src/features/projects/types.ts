import { UnwrapDiscriminatedResponseData } from '@/types/utils';
import { UseQueryResult } from '@tanstack/react-query';
import { Models } from 'node-appwrite';
import { getProjectsAction } from './actions';
import useProjects from './hooks/useProjectsQuery';

export type DatabaseProject = Models.Row & {
  name: string;
  ownerId: string;
  workspaceId: string;
  imageId: string | null;
};

export type ResponseProjectsList = UnwrapDiscriminatedResponseData<
  typeof getProjectsAction
>;

export type Projects = ReturnType<typeof useProjects> extends UseQueryResult<
  infer T
>
  ? T
  : never;
