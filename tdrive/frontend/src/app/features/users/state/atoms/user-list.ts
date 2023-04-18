import { atom } from 'recoil';
import { UserType } from '@features/users/types/user';

export const UserListState = atom<UserType[]>({
  key: 'UserListState',
  default: [],
});
