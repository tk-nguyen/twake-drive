import { atom } from 'recoil';

export type Filter = {
  mimeType: {
    key: string;
    value: string
  };
  creator: string;
  date: {
    key: string;
    value: string;
  };
  sort: {
    key: string;
    value: string;
  };
};

export const FilterState = atom<Filter>({
  key: 'SharedWithMeFilterState',
  default: {
    mimeType: {
      key: '',
      value: ''
    },
    creator: '',
    date: {
      key: '',
      value: ''
    },
    sort: {
      key: '',
      value: '',
    }
  },
});