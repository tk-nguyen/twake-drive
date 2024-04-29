import { useState, useRef } from 'react';

import type { DriveFileAccessLevel } from '@features/drive/types';

import Languages from 'features/global/services/languages-service';
import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { useCurrentUser } from '@features/users/hooks/use-current-user';
import { useUser } from '@features/users/hooks/use-user';
import { useSearchUsers } from '@features/users/hooks/use-search-user-list';
import { changeUserAccess, getUserAccessLevel, getAllUserAccesses } from '@features/files/utils/access-info-helpers';

import { Subtitle } from '@atoms/text';
import { Input } from '@atoms/input/input-text';
import { Button } from '@atoms/button/button';
import { SearchIcon } from '@heroicons/react/solid';
import { InputDecorationIcon } from '@atoms/input/input-decoration-icon';
import { AccessLevelDropdown } from '../../components/access-level-dropdown';
import UserBlock from '@molecules/grouped-rows/user';

export const InternalAccessManager = ({ id, disabled }: { id: string; disabled: boolean }) => {
  const { item, loading, update } = useDriveItem(id);
  const [level, setLevel] = useState<DriveFileAccessLevel>('manage');
  const usersWithAccess = item && getAllUserAccesses(item);
  const { search, result, query } = useSearchUsers({ scope: 'company' });
  const [searchString, setSearchString] = useState("");
  const [isFocus, setFocus] = useState(false);
  const inputElement = useRef<HTMLInputElement>(null);
  const maxUserResultsShown = 5;
  const minUserHeight = 3;
  const showResults = isFocus && query?.trim();

  const knownUsers = item && new Set(getAllUserAccesses(item).map(({id}) => id));
  const absentUserResults = item && result && result.filter(({id}) => !knownUsers?.has(id!));
  const shownResults = absentUserResults && absentUserResults.slice(0, maxUserResultsShown);
  const resultFooterText = knownUsers && shownResults &&
    (shownResults.length == 0
    ? Languages.t('components.user_picker.modal_results_count_none', [searchString])
    : (absentUserResults.length > maxUserResultsShown
        ? Languages.t('components.user_picker.modal_results_truncated', [maxUserResultsShown, absentUserResults.length])
        : false
      ));

  const [selectedUserKey, setSelectedUserKey] = useState('');
  const selectedKeyIndex = shownResults ? shownResults.findIndex(({id}) => id === selectedUserKey) : -1;

  const moveSelection = (offset: number) => {
    if (!shownResults) return;
    if (selectedKeyIndex === -1) {
      if (offset < 0)
        setSelectedUserKey(shownResults[shownResults.length - 1].id || '');
      else if (offset > 0)
        setSelectedUserKey(shownResults[0].id || '');
    } else if (selectedKeyIndex != null) {
      const nextIndex = (selectedKeyIndex + shownResults.length + offset) % shownResults.length;
      setSelectedUserKey(shownResults[nextIndex].id || '');
    }
  };

  const doEnterKey = () => {
    const user = shownResults && selectedKeyIndex > -1 && shownResults[selectedKeyIndex];
    if (user) {
      item && update(changeUserAccess(item, user.id!, level));
      search('');
    }
    setSelectedUserKey('');
  };

  const keyEvents : { [key: string]: () => void } = {
    "ArrowUp": () => moveSelection(-1),
    "ArrowDown": () => moveSelection(1),
    "Enter": () => doEnterKey(),
  };

  return (
    <>
      <Subtitle className="block mt-2 mb-1">
        {Languages.t('components.internal-access_manage_subtitle')}
      </Subtitle>
      <div className="rounded-md border-t mt-2 dark:border-zinc-700">
        <div className="p-4 flex flex-row items-center justify-center rounded-t-md border-x dark:border-zinc-700">
          <div className="grow">
            <InputDecorationIcon
              prefix={SearchIcon}
              input={({ className }) => (
                <Input
                  onFocus={() => setFocus(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      if (inputElement.current !== document.activeElement) {
                        setFocus(false);
                      }
                    }, 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.code in keyEvents) {
                      keyEvents[e.code]();
                      e.preventDefault();
                    }
                  }}
                  placeholder={Languages.t('components.select-users_search_users')}
                  className={className + ' w-full rounded-r-none'}
                  theme="plain"
                  onChange={e => {
                    search(e.target.value);
                    setSearchString(e.target.value);
                  }}
                  value={searchString}
                  inputRef={inputElement}
                />
              )}
            />
          </div>
          <div className="shrink-0">
            <AccessLevelDropdown
              className="rounded-l-none !p-0 leading-tight text-end !pr-8 !pl-2 border-none bg-zinc-100 dark:bg-zinc-800"
              disabled={loading || disabled}
              hiddenLevels={['remove']}
              level={level}
              onChange={level => setLevel(level)}
            />
          </div>
        </div>
        {showResults &&
          <>
            <div className="flex flex-row border-t !border-x-0 dark:border-zinc-700 h-1" />
            <div className="relative w-full h-0">  {/* Necessary so the relative results don't take height */}
              <div className={(showResults ? "rounded-md " : "rounded-md ") + "absolute z-10 w-full shadow-md border bg-white dark:bg-zinc-900 mt-2 dark:border-zinc-700"}>
                { shownResults && shownResults.map((user, index) =>
                  <UserAccessLevel
                    key={user.id}
                    id={id}
                    userId={user.id!}
                    disabled={disabled}
                    className={'!border-x-0' + (index === selectedKeyIndex ? ' ring' : (index > 0 && index !== ((selectedKeyIndex ?? 0) + 1) ? ' border-t' : ''))}
                    isSearchResultAdd={level}
                    onAddSearchResult={(userId) => {
                      item && update(changeUserAccess(item, userId, level));
                    }}
                    />
                )}
                {!loading && resultFooterText && <>
                  <div className={(result.length == 0 ? 'rounded-md' : 'rounded-b-md') + ' grow text-center italic dark:text-zinc-400 py-2 dark:border-zinc-700 border-t bg-zinc-100 dark:bg-zinc-800'}>
                    {resultFooterText}
                  </div>
                </>}
              </div>
            </div>
            <div className="flex flex-row !border-x-0 dark:border-zinc-700 h-2" />
          </>}
        {usersWithAccess?.map((user, index) =>
          <UserAccessLevel
            key={user.id}
            id={id}
            userId={user?.id}
            disabled={disabled}
            className={(showResults ? '!rounded-none !rounded-t-md' : '') + (index === usersWithAccess.length - 1 ? ' rounded-b-md border-y' : ' border-t')}
            />
          )}
        {(usersWithAccess?.length ?? 0) < minUserHeight &&
          [...Array(minUserHeight - (usersWithAccess?.length ?? 0))].map((_, i) =>
            <div key={i} className="p-4 flex flex-row">
              <div className='w-9 h-9 border border-transparent' /> {/* make same size as userblock */}
            </div>
          )}
        {(!showResults) &&
          <div className="mt-2 flex flex-row items-center justify-center border-none h-1">&nbsp;</div>
        }
      </div>
    </>
  );
};

const UserAccessLevel = (props: {
  id: string;
  userId: string;
  disabled: boolean;
  className?: string;
  isSearchResultAdd?: DriveFileAccessLevel;
  onAddSearchResult?: (userId: string) => void,
}) => {
  const { item, loading, update } = useDriveItem(props.id);
  const user = useUser(props.userId);
  const { user: currentUser } = useCurrentUser();
  return (
    <UserBlock
      className={"p-4 border-x dark:border-zinc-700" + ' ' + (props.className ?? '')}
      user={user}
      isSelf={!!currentUser?.id && user?.id === currentUser?.id}
      suffix={
        props.isSearchResultAdd
        ? <Button
            disabled={loading || props.disabled || user?.id === currentUser?.id}
            onClick={() => user && props.onAddSearchResult!(props.userId)}
            size="sm"
            >
            {Languages.t('components.user_picker.modal.result_add.' + props.isSearchResultAdd)}
          </Button>

        : <AccessLevelDropdown
            disabled={loading || props.disabled || user?.id === currentUser?.id}
            level={(item && getUserAccessLevel(item, props.userId)) || "none"}
            onChange={level => item && update(changeUserAccess(item, props.userId, level === 'remove' ? false : level))}
            />
      }
    />
  );
};
