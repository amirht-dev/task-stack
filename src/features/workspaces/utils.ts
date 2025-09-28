export function formatMembersCount(members: number) {
  return `${members} member${members > 1 ? 's' : ''}`;
}

export function formatAvatarFallback(name: string) {
  return name
    .split(' ')
    .map((word) => word.at(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
