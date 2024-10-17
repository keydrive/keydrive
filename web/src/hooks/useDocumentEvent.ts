import { useEffect } from 'react';

export function useDocumentEvent<T extends keyof DocumentEventMap>(
  type: T,
  listener: (this: Document, e: DocumentEventMap[T]) => void,
): void {
  useEffect(() => {
    document.addEventListener(type, listener);
    return () => document.removeEventListener(type, listener);
  }, [type, listener]);
}
