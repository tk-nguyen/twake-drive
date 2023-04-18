import { useGlobalEffect } from '@features/global/hooks/use-global-effect';
import { AttachedFileType } from '@features/files/types/file';
import ViewerAPIClient, { MessageFileDetails } from '../api/viewer-api-client';
import { atom, useRecoilState } from 'recoil';
import FileUploadApiClient from '@features/files/api/file-upload-api-client';
import FileUploadService from '@features/files/services/file-upload-service';
import { LoadingState } from '@features/global/state/atoms/Loading';

export const FileViewerState = atom<{
  file: null | { company_id?: string; message_id?: string; id?: string; drive_id?: string };
  details?: MessageFileDetails;
  loading: boolean;
}>({
  key: 'FileViewerState',
  default: {
    file: null,
    details: undefined,
    loading: true,
  },
});

export const useFileViewerModal = () => {
  const [status, setStatus] = useRecoilState(FileViewerState);

  return {
    open: (file: AttachedFileType) => {
      if (file.metadata?.source === 'internal') setStatus({ file, loading: true });
    },
    close: () => setStatus({ file: null, loading: true }),
    isOpen: !!status?.file,
  };
};

export const useFileViewer = () => {
  const [status, setStatus] = useRecoilState(FileViewerState);
  const modal = useFileViewerModal();

  useGlobalEffect(
    'useFileViewer',
    async () => {
      if (modal.isOpen && status.file) {
        setStatus({
          ...status,
          loading: true,
        });

        const details = await ViewerAPIClient.getMessageFile(
          status.file.company_id || '',
          status.file.message_id || '',
          status.file.id || '',
        );

        setStatus({
          ...status,
          details: details.resource || (details as unknown as MessageFileDetails),
          loading: false,
        });
      }
    },
    [status.file?.id],
  );

  return {
    ...modal,
    status,
    loading: status.loading,
    next: () => {
      if (status.details?.navigation?.next && !status.loading)
        setStatus({
          ...status,
          file: {
            company_id: status.file?.company_id || '',
            message_id: status.details?.navigation.next?.message_id,
            id: status.details?.navigation.next?.id,
          },
        });
    },
    previous: () => {
      if (status.details?.navigation?.previous && !status.loading)
        setStatus({
          ...status,
          file: {
            company_id: status.file?.company_id || '',
            message_id: status.details?.navigation.previous?.message_id,
            id: status.details?.navigation.previous?.id,
          },
        });
    },
  };
};

export const useViewerDataLoading = () => {
  const [loading, setLoading] = useRecoilState(LoadingState('useViewerDataLoading'));
  return { loading, setLoading };
};

export const useViewerDisplayData = () => {
  const { status } = useFileViewer();

  if (!status) {
    return {};
  }

  const name = status?.details?.metadata?.name || '';
  const extension = name?.split('.').pop();

  const download = FileUploadService.getDownloadRoute({
    companyId: status?.details?.metadata?.external_id?.company_id,
    fileId: status?.details?.metadata?.external_id?.id,
  });

  const type = FileUploadApiClient.mimeToType(status?.details?.metadata?.mime || '', extension);
  const id = status?.details?.metadata?.external_id?.id;

  return { download, type, name, id };
};
