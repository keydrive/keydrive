import { RefObject, useEffect, useRef } from 'react';

export const useMountedState = (): RefObject<boolean> => {
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, [mounted]);

  return mounted;
};
