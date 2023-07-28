import { useState, useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { DriveCurrentFolderAtom } from './browser';
import { ConfirmDeleteModalAtom } from './modals/confirm-delete';
import { ConfirmTrashModalAtom } from './modals/confirm-trash';
import { CreateModalAtom } from './modals/create';
import { PropertiesModalAtom } from './modals/properties';
import { SelectorModalAtom } from './modals/selector';
import { AccessModalAtom } from './modals/update-access';
import { VersionsModalAtom } from './modals/versions';
import { DriveApiClient, getPublicLinkToken } from '@features/drive/api-client/api-client';
import { useDriveActions } from '@features/drive/hooks/use-drive-actions';
import {getPublicLink, useDriveItem} from '@features/drive/hooks/use-drive-item';
import { useDrivePreview } from '@features/drive/hooks/use-drive-preview';
import { DriveItemSelectedList } from '@features/drive/state/store';
import { DriveItem, DriveItemDetails } from '@features/drive/types';
import { ToasterService } from '@features/global/services/toaster-service';
import { copyToClipboard } from '@features/global/utils/CopyClipboard';
import { FilterState } from 'features/drive/state/filter';
import { getCurrentUserList } from '@features/users/hooks/use-user-list';
import _ from 'lodash';
import Languages from 'features/global/services/languages-service';
import {useHistory} from "react-router-dom";
import useRouterCompany from "features/router/hooks/use-router-company";
import FilterService from 'app/features/users/services/filter-service';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';

/**
 * This will build the context menu in different contexts
 */
export const useOnBuildContextMenu = (children: DriveItem[], initialParentId?: string) => {
  const [checkedIds, setChecked] = useRecoilState(DriveItemSelectedList);
  const checked = children.filter(c => checkedIds[c.id]);
  const { user } = useCurrentUser();
  const [_, setParentId] = useRecoilState(
    DriveCurrentFolderAtom({ initialFolderId: initialParentId || 'user_'+user?.id }),
  );

  const { download, downloadZip, update } = useDriveActions();
  const setCreationModalState = useSetRecoilState(CreateModalAtom);
  const setSelectorModalState = useSetRecoilState(SelectorModalAtom);
  const setConfirmDeleteModalState = useSetRecoilState(ConfirmDeleteModalAtom);
  const setConfirmTrashModalState = useSetRecoilState(ConfirmTrashModalAtom);
  const setVersionModal = useSetRecoilState(VersionsModalAtom);
  const setAccessModalState = useSetRecoilState(AccessModalAtom);
  const setPropertiesModalState = useSetRecoilState(PropertiesModalAtom);
  const { open: preview } = useDrivePreview();

  return useCallback(
    async (parent?: Partial<DriveItemDetails> | null, item?: DriveItem) => {
      if (!parent || !parent.access) return [];

      try {
        const inTrash = parent.path?.[0]?.id === 'trash';
        const selectedCount = checked.length;

        let menu: any[] = [];

        if (item && selectedCount < 2) {
          //Add item related menus
          const upToDateItem = await DriveApiClient.get(item.company_id, item.id);
          const access = upToDateItem.access || 'none';
          const newMenuActions = [
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.preview'),
              hide: item.is_directory,
              onClick: () => preview(item),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.share'),
              hide: access === 'read' || getPublicLinkToken(),
              onClick: () => setAccessModalState({ open: true, id: item.id }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.download'),
              onClick: () => download(item.last_version_cache.file_metadata.external_id),
            },
            { type: 'separator' },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.manage_access'),
              hide: access === 'read' || getPublicLinkToken(),
              onClick: () => setAccessModalState({ open: true, id: item.id }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.move'),
              hide: access === 'read',
              onClick: () =>
                setSelectorModalState({
                  open: true,
                  parent_id: inTrash ? 'root' : item.parent_id,
                  mode: 'move',
                  title:
                    Languages.t('components.item_context_menu.move.modal_header') +
                    ` '${item.name}'`,
                  onSelected: async ids => {
                    await update(
                      {
                        parent_id: ids[0],
                      },
                      item.id,
                      item.parent_id,
                    );
                  },
                }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.rename'),
              hide: access === 'read',
              onClick: () => setPropertiesModalState({ open: true, id: item.id }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.copy_link'),
              hide: !item.access_info.public?.level || item.access_info.public?.level === 'none',
              onClick: () => {
                copyToClipboard(getPublicLink(item || parent?.item));
                ToasterService.success(
                  Languages.t('components.item_context_menu.copy_link.success'),
                );
              },
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.versions'),
              hide: item.is_directory,
              onClick: () => setVersionModal({ open: true, id: item.id }),
            },
            { type: 'separator', hide: access !== 'manage' },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.move_to_trash'),
              className: 'error',
              hide: inTrash || access !== 'manage',
              onClick: () => setConfirmTrashModalState({ open: true, items: [item] }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.delete'),
              className: 'error',
              hide: !inTrash || access !== 'manage',
              onClick: () => setConfirmDeleteModalState({ open: true, items: [item] }),
            },
          ];
          if (newMenuActions.filter(a => !a.hide).length) {
            menu = [...newMenuActions];
          }
        }

        if (selectedCount && (selectedCount >= 2 || !item)) {
          // Add selected items related menus
          const newMenuActions: any[] = [
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.move_multiple'),
              hide: parent.access === 'read',
              onClick: () =>
                setSelectorModalState({
                  open: true,
                  parent_id: inTrash ? 'root' : parent.item!.id,
                  title: Languages.t('components.item_context_menu.move_multiple.modal_header'),
                  mode: 'move',
                  onSelected: async ids => {
                    for (const item of checked) {
                      await update(
                        {
                          parent_id: ids[0],
                        },
                        item.id,
                        item.parent_id,
                      );
                    }
                    setChecked({});
                  },
                }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.download_multiple'),
              onClick: () =>
                selectedCount === 1 ? download(checked[0].id) : downloadZip(checked.map(c => c.id)),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.clear_selection'),
              onClick: () => setChecked({}),
            },
            { type: 'separator', hide: parent.access === 'read' },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.delete_multiple'),
              hide: !inTrash || parent.access !== 'manage',
              className: 'error',
              onClick: () => {
                setConfirmDeleteModalState({
                  open: true,
                  items: checked,
                });
              },
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.to_trash_multiple'),
              hide: inTrash || parent.access !== 'manage',
              className: 'error',
              onClick: async () =>
                setConfirmTrashModalState({
                  open: true,
                  items: checked,
                }),
            },
          ];
          if (menu.length && newMenuActions.filter(a => !a.hide).length) {
            menu = [...menu, { type: 'separator' }];
          }
          menu = [...menu, ...newMenuActions];
        } else if (!item) {
          //Add parent related menus
          const newMenuActions: any[] = inTrash
            ? [
                {
                  type: 'menu',
                  text: Languages.t('components.item_context_menu.trash.exit'),
                  onClick: () => setParentId('root'),
                },
                { type: 'separator' },
                {
                  type: 'menu',
                  text: Languages.t('components.item_context_menu.trash.empty'),
                  className: 'error',
                  hide: parent.item!.id != 'trash' || parent.access !== 'manage',
                  onClick: () => {
                    setConfirmDeleteModalState({
                      open: true,
                      items: children, //Fixme: Here it works because this menu is displayed only in the trash root folder
                    });
                  },
                },
              ]
            : [
                {
                  type: 'menu',
                  text: Languages.t('components.item_context_menu.add_documents'),
                  hide: inTrash || parent.access === 'read',
                  onClick: () =>
                    parent?.item?.id &&
                    setCreationModalState({ open: true, parent_id: parent?.item?.id }),
                },
                {
                  type: 'menu',
                  text: Languages.t('components.item_context_menu.download_folder'),
                  hide: inTrash,
                  onClick: () => downloadZip([parent.item!.id]),
                },
                {
                  type: 'menu',
                  text: Languages.t('components.item_context_menu.copy_link'),
                  hide:
                    !parent?.item?.access_info?.public?.level ||
                    parent?.item?.access_info?.public?.level === 'none',
                  onClick: () => {
                    copyToClipboard(getPublicLink(item || parent?.item));
                    ToasterService.success(
                      Languages.t('components.item_context_menu.copy_link.success'),
                    );
                  },
                },
                { type: 'separator', hide: inTrash || parent.access === 'read' },
                {
                  type: 'menu',
                  text: Languages.t('components.item_context_menu.go_to_trash'),
                  hide: inTrash || parent.access === 'read',
                  onClick: () => setParentId('trash'),
                },
              ];
          if (menu.length && newMenuActions.filter(a => !a.hide).length) {
            menu = [...menu, { type: 'separator' }];
          }
          menu = [...menu, ...newMenuActions];
        }

        return menu;
      } catch (e) {
        console.error(e);
        ToasterService.error('An error occurred');
      }
      return [];
    },
    [
      checked,
      setChecked,
      setSelectorModalState,
      setConfirmDeleteModalState,
      setConfirmTrashModalState,
      download,
      downloadZip,
      update,
      preview,
      setParentId,
      setCreationModalState,
      setVersionModal,
      setAccessModalState,
      setPropertiesModalState,
    ],
  );
};

export const useOnBuildFileTypeContextMenu = () => {
  const { user } = useCurrentUser();
  const [parentId, _setParentId] = useRecoilState(
      DriveCurrentFolderAtom({ initialFolderId:'user_'+user?.id }),
  );
  const history = useHistory();
  const [filter, setFilter] = useRecoilState(FilterState);
  const mimeTypes = [
    { key: Languages.t('components.item_context_menu.all'), value: '' },
    { key: 'CSV', value: 'csv' },
    { key: 'DOC', value: 'doc' },
    { key: 'DOCX', value: 'docx' },
    { key: 'GIF', value: 'gif' },
    { key: 'JPEG', value: 'jpeg' },
    { key: 'JPG', value: 'jpg' },
    { key: 'PDF', value: 'pdf' },
    { key: 'PNG', value: 'png' },
    { key: 'PPT', value: 'ppt' },
    { key: 'TXT', value: 'txt' },
    { key: 'XLS', value: 'xls' },
    { key: 'ZIP', value: 'zip' },
  ];
  return useCallback(() => {
    const menuItems = mimeTypes.map(item => {
      return {
        type: 'menu',
        text: item.key,
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              mimeType: item,
            };
            return newFilter;
          });
          FilterService.setFilterURL(history, `${item.value}-${filter.date.value}-${filter.sort.value}`)
        },
      };
    });
    return menuItems;
  }, [setFilter, filter]);
};

export const useOnBuildPeopleContextMenu = () => {
  const [filter, setFilter] = useRecoilState(FilterState);
  const [_userList, setUserList] = useState(getCurrentUserList());
  let userList = _userList;
  userList = _.uniqBy(userList, 'id');
  return useCallback(() => {
    const menuItems = userList.map(user => {
      return {
        type: 'menu',
        text: user.first_name,
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              creator: user.id ?? '',
            };
            return newFilter;
          });
        },
      };
    });
    return menuItems;
  }, [setFilter]);
};

export const useOnBuildDateContextMenu = () => {
  const { user } = useCurrentUser();
  const [parentId, _setParentId] = useRecoilState(
      DriveCurrentFolderAtom({ initialFolderId:'user_'+user?.id }),
  );
  const history = useHistory();
  const company = useRouterCompany();
  const [filter, setFilter] = useRecoilState(FilterState);
  return useCallback(() => {
    const menuItems = [
      {
        type: 'menu',
        text: Languages.t('components.item_context_menu.all'),
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              date: {
                key: Languages.t('components.item_context_menu.all'),
                value: ''
              },
            };
            return newFilter;
          });
          FilterService.setFilterURL(history, `${filter.mimeType.value}--${filter.sort.value}`)
        },
      },
      {
        type: 'menu',
        text: Languages.t('components.item_context_menu.today'),
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              date: {
                key: Languages.t('components.item_context_menu.today'),
                value: 'today'
              }
            };
            return newFilter;
          });
          FilterService.setFilterURL(history, `${filter.mimeType.value}-today-${filter.sort.value}`)
        },
      },
      {
        type: 'menu',
        text: Languages.t('components.item_context_menu.last_week'),
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              date: {
                key: Languages.t('components.item_context_menu.last_week'),
                value: 'last_week'
              }
            };
            return newFilter;
          });
          FilterService.setFilterURL(history, `${filter.mimeType.value}-last_week-${filter.sort.value}`)
        },
      },
      {
        type: 'menu',
        text: Languages.t('components.item_context_menu.last_month'),
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              date: {
                key: Languages.t('components.item_context_menu.last_month'),
                value: 'last_month'
              }
            };
            return newFilter;
          });
          FilterService.setFilterURL(history, `${filter.mimeType.value}-last_month-${filter.sort.value}`)
        },
      },
    ];
    return menuItems;
  }, [setFilter, filter]);
};

export const useOnBuildSortingContextMenu = () => {
  const { user } = useCurrentUser();
  const [parentId, _setParentId] = useRecoilState(
      DriveCurrentFolderAtom({ initialFolderId:'user_'+user?.id }),
  );
  const history = useHistory();
  const company = useRouterCompany();
  const [filter, setFilter] = useRecoilState(FilterState);
  return useCallback(() => {
    const menuItems = [
      {
        type: 'menu',
        text: Languages.t('components.item_context_menu.default'),
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              sort: {
                key: Languages.t('components.item_context_menu.default'),
                value: ''
              },
            };
            return newFilter;
          });
          FilterService.setFilterURL(history, `${filter.mimeType.value}-${filter.date.value}-`)
        },
      },
      {
        type: 'menu',
        text: Languages.t('components.item_context_menu.alphabetical_order'),
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              sort: {
                key: Languages.t('components.item_context_menu.alphabetical_order'),
                value: 'alphabetical_order'
              },
            };
            return newFilter;
          });
          FilterService.setFilterURL(history, `${filter.mimeType.value}-${filter.date.value}-alphabetical_order`)
        },
      },
      {
        type: 'menu',
        text: Languages.t('components.item_context_menu.anti_alphabetical_order'),
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              sort: {
                key: Languages.t('components.item_context_menu.anti_alphabetical_order'),
                value: 'anti_alphabetical_order'
              }
            };
            return newFilter;
          });
          FilterService.setFilterURL(history, `${filter.mimeType.value}-${filter.date.value}-anti_alphabetical_order`)
        },
      },
      {
        type: 'menu',
        text: Languages.t('components.item_context_menu.ascending_modification_date'),
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              sort: {
                key: Languages.t('components.item_context_menu.ascending_modification_date'),
                value: 'ascending_modification_date'
              }
            };
            return newFilter;
          });
          FilterService.setFilterURL(history, `${filter.mimeType.value}-${filter.date.value}-ascending_modification_date`)
        },
      },
      {
        type: 'menu',
        text: Languages.t('components.item_context_menu.descending_modification_date'),
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              sort: {
                key: Languages.t('components.item_context_menu.descending_modification_date'),
                value: 'descending_modification_date'
              }
            };
            return newFilter;
          });
          FilterService.setFilterURL(history, `${filter.mimeType.value}-${filter.date.value}-descending_modification_date`)
        },
      },
    ];
    return menuItems;
  }, [setFilter, filter]);
};

export const useOnBuildFileContextMenu = () => {
  const { download } = useDriveActions();
  const { open: preview } = useDrivePreview();
  return useCallback(
    (item: DriveItem) => {
      console.log(item);
      const menuItems = [
        {
          type: 'menu',
          text: Languages.t('components.item_context_menu.preview'),
          onClick: () => preview(item),
        },
        {
          type: 'menu',
          text: Languages.t('components.item_context_menu.download'),
          onClick: () => download(item.id),
        },
      ];
      return menuItems;
    },
    [download, preview],
  );
};
