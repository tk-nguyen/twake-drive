import Avatar from '@atoms/avatar';
import { Base, Info } from '@atoms/text';
import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { DriveFileAccessLevel } from '@features/drive/types';
import { useCurrentUser } from '@features/users/hooks/use-current-user';
import { useUser } from '@features/users/hooks/use-user';
import currentUserService from '@features/users/services/current-user-service';
import { UserType } from '@features/users/types/user';
import { useState } from 'react';
import SelectUsers from '../../components/select-users';
import { AccessLevel } from './common';
import Languages from 'features/global/services/languages-service';


export const InternalAccessManager = ({ id, disabled }: { id: string; disabled: boolean }) => {
  const { item } = useDriveItem(id);
  const userEntities = item?.access_info.entities.filter(a => a.type === 'user') || [];

  return (
    <>
      <Base className="block mt-4 mb-1">{Languages.t('components.internal-access_specific_rules')}</Base>
      <div className="rounded-md border mt-2">
        <UserAccessSelector id={id} disabled={disabled} />

        {userEntities
          ?.sort((a, b) => a?.id?.localeCompare(b?.id))
          ?.map(user => (
            <UserAccessLevel key={user.id} id={id} userId={user?.id} disabled={disabled} />
          ))}
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
            const id = users[0]?.id;
            update({
              access_info: {
                entities: [
                  //Add or replace existing user
                  ...(item?.access_info.entities.filter(a => a.type !== 'user' || a.id !== id) ||
                    []),
                  ...((id ? [{ type: 'user', id, level }] : []) as any),
                ],
                public: item?.access_info.public,
              },
            });
          }}
          initialUsers={[]}
        />
      </div>
      <div className="shrink-0">
        <AccessLevel
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
  const level =
    item?.access_info.entities.filter(a => a.type === 'user' && a.id === userId)?.[0]?.level ||
    'none';

  return (
    <div className="p-4 border-t flex flex-row items-center justify-center">
      <div className="shrink-0">
        <Avatar
          avatar={user?.thumbnail || ''}
          title={!user ? '-' : currentUserService.getFullName(user)}
          size="sm"
        />
      </div>
      <div className="grow ml-2">
        <Base>{!!user && currentUserService.getFullName(user)}</Base>{' '}
        {user?.id === currentUser?.id && <Info>{Languages.t('components.internal-access_specific_rules_you')}</Info>}
      </div>
      <div className="shrink-0 ml-2">
        <AccessLevel
          disabled={loading || disabled || user?.id === currentUser?.id}
          level={level}
          canRemove
          onChange={level => {
            update({
              access_info: {
                entities:
                  level === 'remove'
                    ? item?.access_info?.entities.filter(
                        e => e.type !== 'user' || e.id !== userId,
                      ) || []
                    : item?.access_info?.entities.map(e => {
                        if (e.type === 'user' && e.id === userId) {
                          return { ...e, level };
                        }
                        return e;
                      }) || [],
                public: item?.access_info.public,
              },
            });
          }}
        />
      </div>
    </div>
  );
};
