import { Base } from '@atoms/text';
import UserBlock from '@molecules/grouped-rows/user';
import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { DriveFileAccessLevel } from '@features/drive/types';
import { useCurrentUser } from '@features/users/hooks/use-current-user';
import { useUser } from '@features/users/hooks/use-user';
import { UserType } from '@features/users/types/user';
import { useState } from 'react';
import SelectUsers from '../../components/select-users';
import { AccessLevelDropdown } from './access-level-dropdown';
import Languages from 'features/global/services/languages-service';
import { changeUserAccess, getUserAccessLevel, getAllUserAccesses } from '@features/files/utils/access-info-edits';


export const InternalAccessManager = ({ id, disabled }: { id: string; disabled: boolean }) => {
  const { item } = useDriveItem(id);

  return (
    <>
      <Base className="block mt-4 mb-1">{Languages.t('components.internal-access_specific_rules')}</Base>
      <div className="rounded-md border mt-2 dark:border-zinc-700">
        <UserAccessSelector id={id} disabled={disabled} />

        {item && getAllUserAccesses(item)?.map(user =>
          <UserAccessLevel key={user.id} id={id} userId={user?.id} disabled={disabled} />
          )}
        <div className="-mb-px" />
      </div>
    </>
  );
};

const UserAccessSelector = ({ id, disabled }: { id: string; disabled: boolean }) => {
  const { item, loading, update } = useDriveItem(id);
  const [level, setLevel] = useState<DriveFileAccessLevel>('manage');

  return (
    <div className="p-4 flex flex-row items-center justify-center">
      <div className="grow">
        <SelectUsers
          className="rounded-r-none"
          level={level}
          onChange={(users: UserType[]) => {
            const id = users[0]?.id; //TODO: all others ignored
            item && id && update(changeUserAccess(item, id, level));
          }}
          initialUsers={[]}
        />
      </div>
      <div className="shrink-0">
        <AccessLevelDropdown
          className="rounded-l-none"
          disabled={loading || disabled}
          level={level}
          onChange={level => setLevel(level)}
        />
      </div>
    </div>
  );
};

const UserAccessLevel = ({
  id,
  userId,
  disabled,
}: {
  id: string;
  userId: string;
  disabled: boolean;
}) => {
  const { item, loading, update } = useDriveItem(id);
  const user = useUser(userId);
  const { user: currentUser } = useCurrentUser();
  return (
    <UserBlock
      className="p-4 border-t dark:border-zinc-700"
      user={user}
      isSelf={!!currentUser?.id && user?.id === currentUser?.id}
      suffix={
        <AccessLevelDropdown
          disabled={loading || disabled || user?.id === currentUser?.id}
          level={(item && getUserAccessLevel(item, userId)) || "none"}
          canRemove={true}
          onChange={level => item && update(changeUserAccess(item, userId, level === 'remove' ? false : level))}
          />
      }
    />
  );
};
