export interface HeadingWithId {
  id: string;
}

export function ensureHeadingId(
  heading: HeadingWithId,
  index: number,
  occupiedIds: Set<string>,
): string {
  if (heading.id) return heading.id;
  const base = `heading-${index}`;
  let candidate = base;
  let suffix = 2;
  while (occupiedIds.has(candidate)) candidate = `${base}-${suffix++}`;
  heading.id = candidate;
  occupiedIds.add(candidate);
  return candidate;
}
