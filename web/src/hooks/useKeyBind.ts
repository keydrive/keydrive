import { useEffect } from 'react';

export enum KeyCode {
  Escape = 'Escape',
  Enter = 'Enter',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  Home = 'Home',
  End = 'End',
  Delete = 'Delete',
  F2 = 'F2',
}

export const useKeyBind = (key: KeyCode, handler: () => void): void => {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === key) {
        e.preventDefault();
        e.stopPropagation();
        handler();
      }
    };
    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [key, handler]);
};
