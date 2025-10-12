import { useIsFirstRender } from '@uidotdev/usehooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Entries } from 'type-fest';

function useIsStable(value: Record<string, unknown>) {
  const cachedValue = useMemo(() => value, [...Object.values(value)]);
  const valueRef = useRef(cachedValue);
  const [, rerender] = useState({});

  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (isFirstRender) return rerender({});

    const result = Object.fromEntries(
      (Object.entries(cachedValue) as Entries<typeof cachedValue>).map(
        ([key, value]) => [
          key,
          valueRef.current[key] === value ? '✅ stable' : '❌ not stable',
        ]
      )
    );

    console.table(result);
  }, [cachedValue, isFirstRender]);
}

export default useIsStable;
