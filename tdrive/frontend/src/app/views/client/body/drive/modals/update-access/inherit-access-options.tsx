import Languages from 'features/global/services/languages-service';

import type { DriveItem } from 'app/features/drive/types';
import {
  changeAllChannelAccessLevels,
  changeCompanyAccessLevel,
  changeInheritedAccess,
  getCompanyAccessLevel,
  getFirstChannelAccessLevel,
  getInheritedAccessLevel,
} from '@features/files/utils/access-info-helpers';

import { Base, Info, Subtitle } from '@atoms/text';
import { Checkbox } from '@atoms/input/input-checkbox';
import { AccessLevelDropdown } from '../../components/access-level-dropdown';
import AlertManager from '@features/global/services/alert-manager-service';

export const InheritAccessOptions = (props: {
  item?: DriveItem,
  disabled: boolean,
  onUpdate: (item: Partial<DriveItem>) => void,
}) => {
  // TODO: The default to 'manage' surprises me but it's what previous code did, as this commit is a refactoring, aim is to not affect function
  const folderEntityLevel = getInheritedAccessLevel(props.item) || 'manage';
  const companyEntityLevel = getCompanyAccessLevel(props.item);
  const channelEntitiesLevel = getFirstChannelAccessLevel(props.item);

  return (
    <>
      {(companyEntityLevel || folderEntityLevel === 'none' || channelEntitiesLevel) &&
        <Subtitle className="block mt-4 mb-1">{Languages.t('components.internal-access_access_manage')}</Subtitle>}

      { <div className="p-4 flex flex-row items-center justify-center">
          <div className="grow">
            <Base>{Languages.t('components.internal-access_inherit_parent')}</Base>
            <br />
            <Info>{Languages.t('components.internal-access_inherit_parent_perm')}</Info>
          </div>
          <div className="shrink-0 ml-2">
            <Checkbox
              disabled={props.disabled}
              onChange={status => {
                props.item && props.onUpdate(changeInheritedAccess(props.item, status ? 'manage' : 'none'));
              }}
              value={folderEntityLevel === 'manage'}
            />
          </div>
        </div>
      }

      { companyEntityLevel && folderEntityLevel === 'none' && (
        <div className="p-4 flex flex-row items-center justify-center">
          <div className="grow">
            <Base>{Languages.t('components.internal-access_company_member')}</Base>
          </div>
          <div className="shrink-0 ml-2">
            <AccessLevelDropdown
              hiddenLevels={['remove']}
              disabled={props.disabled}
              onChange={level => {
                props.item && props.onUpdate(changeCompanyAccessLevel(props.item, level === 'remove' ? false : level));
              }}
              level={companyEntityLevel}
            />
          </div>
        </div>
      )}

      {channelEntitiesLevel && (
        <div className="p-4 border-b flex flex-row items-center justify-center">
          <div className="grow">
            <Base>{Languages.t('components.internal-access_cannal')}</Base>
            <br />
            <Info>
              {channelEntitiesLevel.length} {Languages.t('components.internal-access_cannal_info')}
            </Info>
          </div>
          <div className="shrink-0 ml-2">
            <AccessLevelDropdown
              disabled={props.disabled}
              hiddenLevels={['none']}
              onChange={level => {
                if (level === 'remove')
                  AlertManager.confirm(
                    async () => {
                      //Remove channel access
                      props.item && props.onUpdate(changeAllChannelAccessLevels(props.item, false));
                    },
                    () => { /* Do nothing */ },
                    {
                      text:  Languages.t('components.internal-access_cannal_info_give_back'),
                    },
                  );
                else
                    props.item && props.onUpdate(changeAllChannelAccessLevels(props.item, level));
              }}
              level={channelEntitiesLevel}
            />
          </div>
        </div>
      )}

    </>);
};

