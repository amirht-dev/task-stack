import { Workspace } from './types';

export function formatMembersCount(members: Workspace['members']) {
  return `${members.total} member${members.total > 1 ? 's' : ''}`;
}
