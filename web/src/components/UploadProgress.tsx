import { useService } from '../hooks/useService';
import { UploadQueue } from '../services/UploadQueue';

export const UploadProgress = () => {
  const uploads = useService(UploadQueue);

  return (
    <div className="upload-progress">
      <div className="done" style={{ width: `30%` }}>
        <div className="text">30%</div>
      </div>
    </div>
  );
};
