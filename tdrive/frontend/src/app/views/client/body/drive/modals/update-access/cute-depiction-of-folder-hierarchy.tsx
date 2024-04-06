import { Base } from '@atoms/text';
import { FolderIcon } from '@heroicons/react/outline';
import type { DriveItem } from 'app/features/drive/types';

export const CuteDepictionOfFolderHierarchy = (props: {
  file?: DriveItem,
  parent?: DriveItem,
}) =>
  <>
    <Base className="p-4 pb-0 flex flex-row items-center justify-center">
      <div className="shrink">
        <FolderIcon className="w-7 mr-2" />
      </div>
      <div className="grow">
        {props.parent?.name}
      </div>
    </Base>
    <Base className="pl-5 flex flex-row items-center justify-center">
      <div className="shrink text-2xl text-zinc-500">
        └
      </div>
      <div className="shrink pl-2">
        <FolderIcon className="w-5 mr-2" />
      </div>
      <div className="grow">
        {props.file?.name}
      </div>
    </Base>
  </>;
