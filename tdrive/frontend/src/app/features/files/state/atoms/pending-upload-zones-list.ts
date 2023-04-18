import { AttachedFileType } from '@features/files/types/file';
import { atomFamily } from 'recoil';

export const PendingUploadZonesListState = atomFamily<AttachedFileType[], string>({
  key: 'PendingUploadZonesListState',
  default: () => [],
});
