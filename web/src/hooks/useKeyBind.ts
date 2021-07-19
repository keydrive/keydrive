import { useEffect } from 'react';

export enum KeyCode {
  Escape = 'Escape',
  Enter = 'Enter',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  Home = 'Home',
  End = 'End',
}

export const useKeyBind = (key: KeyCode, handler: () => void): void => {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      console.debug(e.key);
      if (e.key === key) {
        handler();
      }
    };
    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [key, handler]);
};
