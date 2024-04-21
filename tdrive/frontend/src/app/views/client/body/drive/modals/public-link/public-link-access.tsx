import { Subtitle } from '@atoms/text';
import { useDriveItem, getPublicLink } from '@features/drive/hooks/use-drive-item';
import { copyToClipboard } from '@features/global/utils/CopyClipboard';
import { Input } from 'app/atoms/input/input-text';
import { useState } from 'react';
import { AccessLevelDropdown } from '../../components/access-level-dropdown';
import Languages from 'features/global/services/languages-service';
import { Button } from '@atoms/button/button';
import { LinkIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/outline';
import type { DriveFileAccessLevelForPublicLink } from 'app/features/drive/types';
import { changePublicLink } from '@features/files/utils/access-info-helpers';

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
  const [didJustCompleteACopy, setDidJustCompleteACopy] = useState<boolean>(false);

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
            <Button
              disabled={disabled || (!havePublicLink && publicLinkCreationLevel === 'none')}
              onClick={() => {
                if (havePublicLink) {
                  copyToClipboard(publicLink);
                  if (!didJustCompleteACopy) {
                    // No point enqueuing further ones, the first timeout will undo immediately anyway
                    // so not bothering with useEffect either
                    setDidJustCompleteACopy(true);
                    setTimeout(() => setDidJustCompleteACopy(false), 1500);
                  }
                } else
                  updatePublicLinkLevel(publicLinkCreationLevel);
              }}
              theme={didJustCompleteACopy ? "green" : "primary"}
              className="absolute top-0 right-0 justify-center"
            >
              { didJustCompleteACopy
                ? <CheckCircleIcon className="w-5 mr-2" />
                : <LinkIcon className="w-5 mr-2" />
              }
              {Languages.t(
                didJustCompleteACopy
                ? 'components.public-link-copied-info'
                : (havePublicLink
                  ? "components.public-link-copy"
                  : "components.public-link-get"))}
            </Button>
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
              hiddenLevels={['manage'].concat(havePublicLink ? [] : ['none'])}
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
