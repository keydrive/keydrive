import { RefObject, useEffect } from 'react';

export function useClickOutside(ref: RefObject<HTMLElement>, callback: () => void): void {
  useEffect(() => {
    function handleClick(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
}
