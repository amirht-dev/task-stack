import { usePrevious } from '@uidotdev/usehooks';
import { useEffect, useMemo } from 'react';
import { Entries, RequireAtLeastOne } from 'type-fest';

function useIsChanged(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: RequireAtLeastOne<Record<string, any>>
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cachedValues = useMemo(() => values, [...Object.values(values)]);

  const prevValues = usePrevious(cachedValues);

  useEffect(() => {
    const result = (
      Object.entries(cachedValues) as Entries<typeof cachedValues>
    ).map(([name, value]) => [
      name,
      prevValues?.[name] === value ? '❌' : '✅',
    ]);

    console.table(Object.fromEntries(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...Object.values(cachedValues)]);
}

export default useIsChanged;
