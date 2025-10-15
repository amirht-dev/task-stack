import { UseQueryResult } from '@tanstack/react-query';
import useMembersQuery from './hooks/useMembersQuery';

export type Members = Awaited<
  ReturnType<typeof useMembersQuery> extends UseQueryResult<infer T> ? T : never
>;
