import { BaseSmall, Title } from '@atoms/text';
import { DriveItem } from '@features/drive/types';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';
import { PublicIcon } from './components/public-icon';
import MenusManager from '@components/menus/menus-manager.jsx';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import Languages from "features/global/services/languages-service";
import { Button } from '@atoms/button/button';
import {
  useOnBuildContextMenu,
  useOnBuildFileTypeContextMenu,
  useOnBuildPeopleContextMenu,
  useOnBuildDateContextMenu,
  useOnBuildDateCreationContextMenu,
  useOnBuildSortingContextMenu,
} from './context-menu';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { SharedWithMeFilterState } from '@features/drive/state/shared-with-me-filter';
import { ChooseFilter, ChooseFilterModalAtom } from './modals/filter';
import { CreateModalAtom } from './modals/create';
import { DriveItemSelectedList } from '@features/drive/state/store';
import Menu from '@components/menus/menu';
import { DriveCurrentFolderAtom } from './browser';
import { useDriveItem } from 'app/features/drive/hooks/use-drive-item';
import { formatBytes } from 'app/features/drive/utils';

export default ({
  path: livePath,
  inTrash,
  setParentId,
}: {
  path: DriveItem[];
  inTrash?: boolean;
  setParentId: (id: string) => void;
}) => {
  const [savedPath, setSavedPath] = useState<DriveItem[]>([]);
  useEffect(() => {
    if (livePath) setSavedPath(livePath);
  }, [livePath]);
  const path = livePath || savedPath;

  return <PathRender inTrash={inTrash || false} path={path} onClick={id => setParentId(id)} />;
};

function cutFileName (name: any){
  if (typeof name !== "undefined" ){
    if (name.length >= 30){
      return name.substring(0,30)+" ...";
    } else {
      return name;
    }
  } else {
    return name;
  }
}

export const PathRender = ({
  path,
  onClick,
}: {
  path: DriveItem[];
  inTrash: boolean;
  onClick: (id: string) => void;
}) => {
  const [parentId, _setParentId] = useRecoilState(
    DriveCurrentFolderAtom({ initialFolderId: 'root' }),
  );
  const {
    sharedWithMe,
    details,
    access,
    item,
    inTrash,
    refresh,
    children,
    loading: loadingParent,
  } = useDriveItem(parentId);
  const [filter, setFilter] = useRecoilState(SharedWithMeFilterState);
  const [checked, setChecked] = useRecoilState(DriveItemSelectedList);
  const pathLength = (path || []).reduce((acc, curr) => acc + curr.name.length, 0);
  const selectedCount = Object.values(checked).filter(v => v).length;
  const onBuildContextMenu = useOnBuildContextMenu(children, 'root');
  const buildFileTypeContextMenu = useOnBuildFileTypeContextMenu();
  const buildPeopleContextMen = useOnBuildPeopleContextMenu();
  const buildDateContextMenu = useOnBuildDateContextMenu();
  const buildDateCreationContextMenu = useOnBuildDateCreationContextMenu()
  const buildSortingContextMenu = useOnBuildSortingContextMenu()
  const [state, setState] = useRecoilState(CreateModalAtom);
  const setSelectorModalState = useSetRecoilState(ChooseFilterModalAtom);
  return (
    <>
    {parentId!=="shared_with_me" ? (
      <nav className="overflow-hidden whitespace-nowrap mr-2 pl-px inline-flex">
            {pathLength < 70 ? (
              (path || [{id:'shared_with_me', name:'Shared with me'}])?.map((a, i) => (
                <PathItem
                  key={a.id}
                  item={a}
                  first={i === 0}
                  last={i + 1 === path?.length}
                  onClick={onClick}
                />
              ))
            ) : (
              <>
                <PathItem
                  key={path[path.length - 3]?.id}
                  item={{
                    ...path[path?.length - 3],
                    name: '...',
                  }}
                  first={true}
                  last={false}
                  onClick={onClick}
                />
                <PathItem
                  key={path[path.length - 2]?.id}
                  item={path[path?.length - 2]}
                  first={false}
                  last={false}
                  onClick={onClick}
                />
                <PathItem
                  key={path[path.length - 1]?.id}
                  item={path[path?.length - 1]}
                  first={false}
                  last={true}
                  onClick={onClick}
                />
              </>
            )}
        </nav>
        ) : (
          <div className="flex items-center">
          <a
            className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
          >
            <Title>{Languages.t('scenes.app.shared_with_me.shared_with_me')}</Title>
          </a>
        </div> 
        )}
      <div className="flex items-center space-x-2 mt-4 mb-6">
        <Button
            theme="secondary"
            className="flex items-center lg:hidden"
            onClick={() => setSelectorModalState({open:true})}
          >
            <span>
                {Languages.t('scenes.app.shared_with_me.filter')}
            </span>
            <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
        </Button>
        <ChooseFilter/>
        <div className="flex items-center space-x-2 max-lg:hidden">
          <div className="">
              <Button
              theme="secondary"
              className="flex items-center"
              onClick={evt => {
              MenusManager.openMenu(
                  buildFileTypeContextMenu(),
                  { x: evt.clientX, y: evt.clientY },
                  'center',
              );
              }}
              >
              <span>
                  {filter.mimeType.key && filter.mimeType.value != 'All'
                      ? filter.mimeType.key
                      : Languages.t('scenes.app.shared_with_me.file_type')}
              </span>
              <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
              </Button>
          </div>
          <div className="flex items-center space-x-2">
              <Button
                  theme="secondary"
                  className="flex items-center"
                  onClick={evt => {
                  MenusManager.openMenu(
                      buildDateContextMenu(),
                      { x: evt.clientX, y: evt.clientY },
                      'center',
                  );
                  }}
              >
                  <span>
                  {filter.date.key && filter.date.key != 'All'
                      ? filter.date.key
                      : Languages.t('scenes.app.shared_with_me.last_modified')}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
              </Button>
          </div>
          <div className="flex items-center space-x-2">
              <Button
                  theme="secondary"
                  className="flex items-center"
                  onClick={evt => {
                  MenusManager.openMenu(
                      buildDateCreationContextMenu(),
                      { x: evt.clientX, y: evt.clientY },
                      'center',
                  );
                  }}
              >
                  <span>
                  {filter.dateCreation.key && filter.dateCreation.key != 'All'
                      ? filter.dateCreation.key
                      : Languages.t('scenes.app.shared_with_me.last_created')}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
              </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            theme="secondary"
            className="flex items-center"
            onClick={evt => {
              MenusManager.openMenu(
                buildSortingContextMenu(),
                { x: evt.clientX, y: evt.clientY },
                'center',
              );
            }}
          >
            <span>
              {filter.sort.key && filter.sort.key != 'All'
                ? filter.sort.key
                : Languages.t('scenes.app.shared_with_me.sort')}
            </span>
            <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
          </Button>
        </div>
        <div className="grow"></div>
        <div className="flex items-center">
          <div className="flex flex row items-center">
              {access !== 'read' && (
                <BaseSmall className='max-lg:hidden'>
                  {formatBytes(item?.size || 0)} {Languages.t('scenes.app.drive.used')}
                </BaseSmall>
              )}
            </div>
            <Menu menu={() => onBuildContextMenu(details)}>
              {' '}
              <Button theme="secondary" className="ml-4 flex flex-row items-center">
                <span>
                  {selectedCount > 1
                    ? `${selectedCount} items`
                    : Languages.t('scenes.app.drive.context_menu')}{' '}
                </span>
                <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
              </Button>
            </Menu>
          </div>
      </div>
    </>
  );
};

const PathItem = ({
  item,
  first,
  last,
  onClick,
}: {
  item: Partial<DriveItem>;
  last?: boolean;
  first?: boolean;
  onClick: (id: string) => void;
}) => {
  const { user } = useCurrentUser();
  return (
    <div className="flex items-center">
      <a
        href="#"
        className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
        onClick={evt => {
        if (first && user?.id) {
            MenusManager.openMenu(
              [
                { type: 'menu', text: Languages.t('components.side_menu.home'), onClick: () => onClick('root') },
                { type: 'menu', text: Languages.t('components.side_menu.my_drive'), onClick: () => onClick('user_' + user?.id) },
                { type: 'menu', text: Languages.t('components.side_menu.shared_with_me'), onClick: () => onClick('shared_with_me') },
              ],
              { x: evt.clientX, y: evt.clientY },
              'center',
            );
          } else {
            onClick(item?.id || '');
          }
        }}
      >
        <Title>{cutFileName(item?.name) || ''}</Title>
      </a>
      {item?.access_info?.public?.level && item?.access_info?.public?.level !== 'none' && (
        <PublicIcon className="h-5 w-5 ml-2" />
      )}
      {first && !!user?.id && (
        <span className="ml-2 -mr-1 text-gray-700">
          <ChevronDownIcon className="w-4 h-4" />
        </span>
      )}
      {!last && (
        <svg
          aria-hidden="true"
          className="w-6 h-6 text-gray-400 mx-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          ></path>
        </svg>
      )}
    </div>
  );
};
