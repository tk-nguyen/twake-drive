import { ChevronDownIcon, DotsHorizontalIcon } from '@heroicons/react/outline';
import { Button } from '@atoms/button/button';
import { Base, BaseSmall, Subtitle, Title } from '@atoms/text';
import Menu from '@components/menus/menu';
import { getFilesTree } from '@components/uploads/file-tree-utils';
import UploadZone from '@components/uploads/upload-zone';
import { setTdriveTabToken } from '@features/drive/api-client/api-client';
import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { DriveRealtimeObject } from '@features/drive/hooks/use-drive-realtime';
import { useDriveUpload } from '@features/drive/hooks/use-drive-upload';
import { DriveItemSelectedList } from '@features/drive/state/store';
import { formatBytes } from '@features/drive/utils';
import useRouterCompany from '@features/router/hooks/use-router-company';
import _ from 'lodash';
import { memo, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { atomFamily, useRecoilState, useSetRecoilState } from 'recoil';
import { DrivePreview } from '../../viewer/drive-preview';
import {
  useOnBuildContextMenu,
  useOnBuildFileTypeContextMenu,
  useOnBuildPeopleContextMenu,
  useOnBuildDateContextMenu,
} from './context-menu';
import { DocumentRow } from './documents/document-row';
import { FolderRow } from './documents/folder-row';
import HeaderPath from './header-path';
import { ConfirmDeleteModal } from './modals/confirm-delete';
import { ConfirmTrashModal } from './modals/confirm-trash';
import { CreateModalAtom } from './modals/create';
import { PropertiesModal } from './modals/properties';
import { AccessModal } from './modals/update-access';
import { VersionsModal } from './modals/versions';
import { SharedFilesTable } from './shared-files-table';
import useRouteState from 'app/features/router/hooks/use-route-state';
import { SharedWithMeFilterState } from '@features/drive/state/shared-with-me-filter';
import MenusManager from '@components/menus/menus-manager.jsx';
import Languages from 'features/global/services/languages-service';
import { sort } from './filter';

export const DriveCurrentFolderAtom = atomFamily<
  string,
  { context?: string; initialFolderId: string }
>({
  key: 'DriveCurrentFolderAtom',
  default: options => options.initialFolderId || 'root',
});

export default memo(
  ({
    context,
    initialParentId,
    tdriveTabContextToken,
    inPublicSharing,
  }: {
    context?: string;
    initialParentId?: string;
    tdriveTabContextToken?: string;
    inPublicSharing?: boolean;
  }) => {
    const companyId = useRouterCompany();
    setTdriveTabToken(tdriveTabContextToken || null);
    const [filter, setFilter] = useRecoilState(SharedWithMeFilterState);

    const [parentId, _setParentId] = useRecoilState(
      DriveCurrentFolderAtom({ context: context, initialFolderId: initialParentId || 'root' }),
    );

    const [loadingParentChange, setLoadingParentChange] = useState(false);
    const {
      sharedWithMe,
      details,
      access,
      item,
      inTrash,
      refresh,
      children,
      loading: loadingParent,
      path,
    } = useDriveItem(parentId);
    const { uploadTree } = useDriveUpload();

    const loading = loadingParent || loadingParentChange;

    const uploadZone = 'drive_' + companyId;
    const uploadZoneRef = useRef<UploadZone | null>(null);

    const setCreationModalState = useSetRecoilState(CreateModalAtom);

    const [checked, setChecked] = useRecoilState(DriveItemSelectedList);

    const setParentId = useCallback(
      async (id: string) => {
        setLoadingParentChange(true);
        try {
          await refresh(id);
          _setParentId(id);
        } catch (e) {
          console.error(e);
        }
        setLoadingParentChange(false);
      },
      [_setParentId],
    );
    //In case we are kicked out of the current folder, we need to reset the parent id
    useEffect(() => {
      if (!loading && !path?.length && !inPublicSharing && !sharedWithMe) setParentId('root');
    }, [path, loading, setParentId]);

    useEffect(() => {
      setChecked({});
      refresh(parentId);
      if (!inPublicSharing) refresh('trash');
    }, [parentId, refresh, filter]);

    const openItemModal = useCallback(() => {
      if (item?.id) setCreationModalState({ open: true, parent_id: item.id });
    }, [item?.id, setCreationModalState]);

    const selectedCount = Object.values(checked).filter(v => v).length;
    const folders = sort(children
      .filter(i => i.is_directory));
    const documents = sort((
      item?.is_directory === false
        ? //We use this hack for public shared single file
          item
          ? [item]
          : []
        : children
    )
      .filter(i => !i.is_directory));

    const onBuildContextMenu = useOnBuildContextMenu(children, initialParentId);
    const { viewId } = useRouteState();

    const handleDragOver = (event: { preventDefault: () => void; }) => {
      event.preventDefault();
    }
    const handleDrop = async (event: {dataTransfer: any; preventDefault: () => void;}) => {
      event.preventDefault();
      const dataTransfer = event.dataTransfer;
              if (dataTransfer) {
                const tree = await getFilesTree(dataTransfer);
                setCreationModalState({ parent_id: '', open: false });
                uploadTree(tree, {
                  companyId,
                  parentId,
              });
              }
    }

    const buildFileTypeContextMenu = useOnBuildFileTypeContextMenu();
    const buildPeopleContextMen = useOnBuildPeopleContextMenu();
    const buildDateContextMenu = useOnBuildDateContextMenu();

    return (
      <>
        {
          <UploadZone
            overClassName={''}
            className="h-full overflow-hidden"
            disableClick
            parent={''}
            multiple={true}
            allowPaste={true}
            ref={uploadZoneRef}
            driveCollectionKey={uploadZone}
            onAddFiles={async (_, event) => {
              const tree = await getFilesTree(event);
              setCreationModalState({ parent_id: '', open: false });
              uploadTree(tree, {
                companyId,
                parentId,
              });
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}

          >
            <DriveRealtimeObject id={parentId} key={parentId} />
            <VersionsModal />
            <AccessModal />
            <PropertiesModal />
            <ConfirmDeleteModal />
            <ConfirmTrashModal />
            <Suspense fallback={<></>}>
              <DrivePreview />
            </Suspense>
            <div
              className={
                'flex flex-col grow h-full overflow-hidden ' +
                (loading && (!children?.length || loadingParentChange) ? 'opacity-50 ' : '')
              }
            >
              <div className="flex flex-row shrink-0 items-center mb-4">
                <div className="grow">
                    <HeaderPath path={path || []} inTrash={inTrash} setParentId={setParentId} />
                </div>
              </div>

              <div className="grow overflow-auto">
                {folders.length > 0 && (
                  <>
                    <Title className="mb-2 block">{Languages.t('scenes.app.drive.folders')}</Title>

                    {folders.map((child, index) => (
                      <FolderRow
                        key={index}
                        className={
                          (index === 0 ? 'rounded-t-md ' : '') +
                          (index === folders.length - 1 ? 'rounded-b-md ' : '')
                        }
                        item={child}
                        onClick={() => {
                          return setParentId(child.id);
                        }}
                        checked={checked[child.id] || false}
                        onCheck={v =>
                          setChecked(_.pickBy({ ...checked, [child.id]: v }, _.identity))
                        }
                        onBuildContextMenu={() => onBuildContextMenu(details, child)}
                      />
                    ))}
                    <div className="my-6" />
                  </>
                )}

                <Title className="mb-2 block">{Languages.t('scenes.app.drive.documents')}</Title>

                {documents.length === 0 && !loading && (
                  <div className="mt-4 text-center border-2 border-dashed rounded-md p-8">
                    <Subtitle className="block mb-2">
                      {Languages.t('scenes.app.drive.nothing')}
                    </Subtitle>
                    {!inTrash && access != 'read' && (
                      <>
                        <Base>{Languages.t('scenes.app.drive.drag_and_drop')}</Base>
                        <br />
                        <Button onClick={() => openItemModal()} theme="primary" className="mt-4">
                          {Languages.t('scenes.app.drive.add_doc')}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {documents.map((child, index) => (
                  <DocumentRow
                    key={index}
                    className={
                      (index === 0 ? 'rounded-t-md ' : '') +
                      (index === documents.length - 1 ? 'rounded-b-md ' : '')
                    }
                    item={child}
                    checked={checked[child.id] || false}
                    onCheck={v => setChecked(_.pickBy({ ...checked, [child.id]: v }, _.identity))}
                    onBuildContextMenu={() => onBuildContextMenu(details, child)}
                  />
                ))}
              </div>
            </div>
          </UploadZone>
        }
      </>
    );
  },
);
