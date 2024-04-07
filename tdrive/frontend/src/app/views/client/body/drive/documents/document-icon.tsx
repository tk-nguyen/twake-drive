import Avatar from '../../../../../atoms/avatar';
import {
  FileTypeArchiveIcon,
  FileTypeDocumentIcon,
  FileTypeLinkIcon,
  FileTypeMediaIcon,
  FileTypePdfIcon,
  FileTypeSlidesIcon,
  FileTypeSpreadsheetIcon,
  FileTypeUnknownIcon,
} from '@atoms/icons-colored';
import { FolderIcon } from '@heroicons/react/solid';
import fileUploadApiClient from '@features/files/api/file-upload-api-client';
import type { DriveItem, FileMetadata } from 'app/features/drive/types';

export const DocumentIcon = (props: {
  item?: DriveItem;
  className?: string;
  fileType?: string;
  blueiffyFolders?: boolean;
}) => {
  const fileType = props.fileType || fileUploadApiClient.mimeToType(
    props.item?.last_version_cache?.file_metadata?.mime || '',
  );
  const metadata = (props.item?.last_version_cache?.file_metadata || {}) as FileMetadata;
  const className = props.className || 'h-5 w-5 shrink-0 text-gray-400';
  return (metadata.thumbnails?.length || 0) > 0 ? (
      <Avatar
        className={props.className}
        avatar={metadata.thumbnails?.[0]?.url}
        size="xs"
        type="square"
        title={metadata.name}
      />
    ) : props.item?.is_directory ? (
      <FolderIcon className={className + (props.blueiffyFolders || props.blueiffyFolders == null ? ' text-blue-500' : '')} />
    ) : fileType === 'image' || fileType === 'video' ? (
      <FileTypeMediaIcon className={className} />
    ) : fileType === 'archive' ? (
      <FileTypeArchiveIcon className={className} />
    ) : fileType === 'pdf' ? (
      <FileTypePdfIcon className={className} />
    ) : fileType === 'document' ? (
      <FileTypeDocumentIcon className={className} />
    ) : fileType === 'spreadsheet' ? (
      <FileTypeSpreadsheetIcon className={className} />
    ) : fileType === 'slides' ? (
      <FileTypeSlidesIcon className={className} />
    ) : fileType === 'link' ? (
      <FileTypeLinkIcon className={className} />
    ) : (
      <FileTypeUnknownIcon className={className} />
    );
};
