import { useEffect, useState } from 'react';
import { UploadQueue, UploadStatus, UploadStatusEvent } from '../services/UploadQueue';
import { useService } from './useService';

export function useUploadStatus() {
  const [status, setStatus] = useState<UploadStatus>();
  const uploads = useService(UploadQueue);

  useEffect(() => {
    const handler = (e: Event) => {
      if (!(e instanceof UploadStatusEvent)) {
        throw new Error(`Expected UploadStatusEvent, got unknown event.`);
      }
      setStatus(e.isDone() ? undefined : e.status);
    };

    uploads.addEventListener('status', handler);
    return () => uploads.removeEventListener('status', handler);
  }, [uploads]);

  return status;
}
