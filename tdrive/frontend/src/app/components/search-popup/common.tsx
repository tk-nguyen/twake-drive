import Strings from 'features/global/utils/strings';
import FileUploadService from 'features/files/services/file-upload-service';
import routerService from '@features/router/services/router-service';
import { DriveApiClient } from '@features/drive/api-client/api-client';
import { DriveItem } from '@features/drive/types';
import { AttachedFileType } from '@features/files/types/file';

export const highlightText = (text?: string, highlight?: string) => {
  if (!text) {
    return '';
  }
  if (!highlight) {
    return text;
  }
  const reg = new RegExp('(' + Strings.removeAccents(highlight) + ')', 'ig');
  return Strings.removeAccents(text).replace(reg, "<span class='highlight'>$1</span>");
};

export const getFileMessageDownloadRoute = (file: AttachedFileType): string => {
  if (file?.metadata?.source === 'internal')
    return FileUploadService.getDownloadRoute({
      companyId: file.metadata?.external_id?.company_id,
      fileId: file.metadata?.external_id?.id,
    });
  return '';
};

export const onFileDownloadClick = (file: AttachedFileType) => {
  const url = getFileMessageDownloadRoute(file);

  url && (window.location.href = url);
};

export const openDriveItem = (driveItem: DriveItem, workspace_id: string, drive_app_id: string) => {
  routerService.push(
    routerService.generateRouteFromState({
      companyId: driveItem.company_id,
      workspaceId: workspace_id,
      channelId: drive_app_id,
    }),
  );
};

export const onDriveItemDownloadClick = async (driveItem: DriveItem) => {
  const url = await DriveApiClient.getDownloadUrl(driveItem.company_id, driveItem.id);

  url && (window.location.href = url);
};
