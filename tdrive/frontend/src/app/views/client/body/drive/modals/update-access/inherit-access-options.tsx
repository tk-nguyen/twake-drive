import Languages from 'features/global/services/languages-service';

import type { DriveItem } from 'app/features/drive/types';

import { Base, Info, Subtitle } from '@atoms/text';
import { Checkbox } from '@atoms/input/input-checkbox';
import { AccessLevelDropdown } from './access-level-dropdown';
import AlertManager from '@features/global/services/alert-manager-service';

export const InheritAccessOptions = (props: {
  item?: DriveItem,
  disabled: boolean,
  onUpdate: (item: Partial<DriveItem>) => void,
}) => {
  const folderEntity = props.item?.access_info.entities.filter(a => a.type === 'folder')?.[0] || {
    type: 'folder',
    id: 'parent',
    level: 'manage',
  };
  const companyEntity = props.item?.access_info.entities.filter(a => a.type === 'company')?.[0];
  const channelEntities = props.item?.access_info.entities.filter(a => a.type === 'channel') || [];

  return (
    <>
      {(companyEntity || folderEntity?.level === 'none' || channelEntities.length > 0) &&
        <Subtitle className="block mt-4 mb-1">{Languages.t('components.internal-access_access_manage')}</Subtitle>}

      {folderEntity && (
        <div className="p-4 flex flex-row items-center justify-center">
          <div className="grow">
            <Base>{Languages.t('components.internal-access_inherit_parent')}</Base>
            <br />
            <Info>{Languages.t('components.internal-access_inherit_parent_perm')}</Info>
          </div>
          <div className="shrink-0 ml-2">
            <Checkbox
              disabled={props.disabled}
              onChange={status => {
                props.onUpdate({
                  access_info: {
                    entities: [
                      ...(props.item?.access_info.entities.filter(a => a.type !== 'folder') || []),
                      { ...folderEntity, level: status ? 'manage' : 'none' },
                    ],
                    public: props.item?.access_info.public,
                  },
                });
              }}
              value={folderEntity.level === 'manage'}
            />
          </div>
        </div>
      )}

      {companyEntity && folderEntity.level === 'none' && (
        <div className="p-4 flex flex-row items-center justify-center">
          <div className="grow">
            <Base>{Languages.t('components.internal-access_company_member')}</Base>
          </div>
          <div className="shrink-0 ml-2">
            <AccessLevelDropdown
              disabled={props.disabled}
              onChange={level => {
                props.onUpdate({
                  access_info: {
                    entities: [
                      ...(props.item?.access_info.entities.filter(a => a.type !== 'company') || []),
                      ...(level !== 'remove' ? [{ ...companyEntity, level }] : []),
                    ],
                    public: props.item?.access_info.public,
                  },
                });
              }}
              level={companyEntity.level}
            />
          </div>
        </div>
      )}

      {channelEntities.length > 0 && (
        <div className="p-4 border-b flex flex-row items-center justify-center">
          <div className="grow">
            <Base>{Languages.t('components.internal-access_cannal')}</Base>
            <br />
            <Info>
              {channelEntities.length} {Languages.t('components.internal-access_cannal_info')}
            </Info>
          </div>
          <div className="shrink-0 ml-2">
            <AccessLevelDropdown
              disabled={props.disabled}
              hiddenLevels={['none']}
              canRemove
              onChange={level => {
                if (level === 'remove') {
                  AlertManager.confirm(
                    async () => {
                      //Remove channel access
                      props.onUpdate({
                        access_info: {
                          entities:
                            props.item?.access_info?.entities.filter(e => e.type !== 'channel') || [],
                          public: props.item?.access_info.public,
                        },
                      });
                    },
                    () => {
                      //Do nothing
                    },
                    {
                      text:  Languages.t('components.internal-access_cannal_info_give_back'),
                    },
                  );
                } else {
                  props.onUpdate({
                    access_info: {
                      entities:
                      props.item?.access_info?.entities.map(e => {
                          if (e.type === 'channel') {
                            return { ...e, level };
                          }
                          return e;
                        }) || [],
                      public: props.item?.access_info.public,
                    },
                  });
                }
              }}
              level={channelEntities[0].level}
            />
          </div>
        </div>
      )}

    </>);
};

