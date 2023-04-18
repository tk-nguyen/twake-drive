import { atom } from 'recoil';
import { PendingFileRecoilType } from '@features/files/types/file';

export const PendingFilesListState = atom<PendingFileRecoilType[] | undefined>({
  key: 'PendingFilesListState',
  default: undefined,
});
