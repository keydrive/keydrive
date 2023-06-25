import { useState } from 'react';
import { UploadQueue, UploadStatus } from '../services/UploadQueue';
import { useService } from './useService';
import { useUploadStatusHandler } from './useUploadStatusHandler';

export function useUploadStatus() {
  const uploads = useService(UploadQueue);
  const [status, setStatus] = useState<UploadStatus | undefined>(uploads.getStatus());
  useUploadStatusHandler((e) => setStatus(e.status));
  return status;
}
