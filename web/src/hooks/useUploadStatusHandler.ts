import { useEffect } from 'react';
import { UploadQueue, UploadStatusEvent } from '../services/UploadQueue';
import { useService } from './useService';

export function useUploadStatusHandler(handler: (e: UploadStatusEvent) => void) {
  const uploads = useService(UploadQueue);

  useEffect(() => {
    const wrappedHandler = (e: Event) => {
      if (!(e instanceof UploadStatusEvent)) {
        throw new Error(`Expected UploadStatusEvent, got unknown event.`);
      }
      handler(e);
    };

    uploads.addEventListener('status', wrappedHandler);
    return () => uploads.removeEventListener('status', wrappedHandler);
  }, [handler, uploads]);
}
