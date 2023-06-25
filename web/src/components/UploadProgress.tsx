import { useUploadStatus } from '../hooks/useUploadStatus';

export const UploadProgress = () => {
  const uploadStatus = useUploadStatus();

  if (!uploadStatus) {
    return null;
  }

  return (
    <div className="upload-progress">
      <div className="done" style={{ width: `${uploadStatus.currentPercent}%` }}>
        <div className="text">{uploadStatus.currentPercent}%</div>
      </div>
    </div>
  );
};
