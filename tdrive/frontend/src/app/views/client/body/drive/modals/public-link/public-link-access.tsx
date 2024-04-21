import { Subtitle } from '@atoms/text';
import { useDriveItem, getPublicLink } from '@features/drive/hooks/use-drive-item';
import { Input } from 'app/atoms/input/input-text';
import { useState } from 'react';
import { AccessLevelDropdown } from '../../components/access-level-dropdown';
import Languages from 'features/global/services/languages-service';
import { UserGroupIcon } from '@heroicons/react/outline';
import type { DriveFileAccessLevelForPublicLink } from 'app/features/drive/types';
import { changePublicLink } from '@features/files/utils/access-info-helpers';
import { CopyLinkButton } from './copy-link-button';

export const PublicLinkManager = ({ id, disabled }: { id: string; disabled?: boolean }) => {
  const { item, loading, update } = useDriveItem(id);
  const publicLink = getPublicLink(item);
  const defaultPublicLinkLevel = 'read';
  const publicLinkLevel = item?.access_info?.public?.level || 'none';
  const havePublicLink = publicLinkLevel !== 'none';
  const [publicLinkCreationLevel, setPublicLinkCreationLevel] = useState<DriveFileAccessLevelForPublicLink>(defaultPublicLinkLevel);
  const publicLinkCreationLevelSafe = havePublicLink ? publicLinkLevel || defaultPublicLinkLevel : publicLinkCreationLevel;
  const updatePublicLinkLevel = (level: DriveFileAccessLevelForPublicLink) => {
    item && update(changePublicLink(item, { level }));
    if (level === 'none')
      setPublicLinkCreationLevel(defaultPublicLinkLevel);
  };

  return (
    <>
      <hr />
      <Subtitle className="block mt-2 mb-1">
        {Languages.t('components.public-link-acess.public_link_access')}
      </Subtitle>
      <div className="rounded-md border dark:border-zinc-700">
        <div className="p-4 flex flex-row items-center justify-center">
          <div className="grow relative">
            <Input
              className={'w-full'}
              disabled={disabled || !havePublicLink}
              readOnly={true}
              onFocus={({target}) => target.select()}
              theme={havePublicLink ? "blue" : "outline"}
              value={havePublicLink ? publicLink : Languages.t('components.public-link-acess.public-link-placeholder')}
            />
            <CopyLinkButton
              textToCopy={havePublicLink && publicLink}
              />
          </div>
        </div>
        <div className="p-4 flex flex-row items-center justify-center text-zinc-800 dark:text-white">
          <div className="shrink-0">
            <UserGroupIcon className="w-6 mr-2" />
          </div>
          <div className="grow">
            {Languages.t('components.public-link-access-level-' + (havePublicLink ? 'update' : 'create'))}
          </div>
          <div className="shrink-0">
            <AccessLevelDropdown
              hiddenLevels={['manage', 'remove'].concat(havePublicLink ? [] : ['none'])}
              disabled={loading || disabled}
              level={publicLinkCreationLevelSafe}
              labelOverrides={{'none': Languages.t('components.public-link-access-level-delete')}}
              onChange={level => {
                if (havePublicLink) {
                  updatePublicLinkLevel(level);
                } else {
                  setPublicLinkCreationLevel(level);
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
