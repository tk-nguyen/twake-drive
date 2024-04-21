import { atom, useRecoilState } from 'recoil';
import { useState, useEffect } from 'react';

import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { useCurrentCompany } from '@features/companies/hooks/use-companies';
import Languages from 'features/global/services/languages-service';
import { changePublicLink, hasAnyPublicLinkAccess } from '@features/files/utils/access-info-helpers';

import { Subtitle } from '@atoms/text';
import { Modal, ModalContent } from '@atoms/modal';

export type PublicLinkModalType = {
  open: boolean;
  id: string;
};

export const PublicLinkModalAtom = atom<PublicLinkModalType>({
  key: 'PublicLinkModalType',
  default: {
    open: false,
    id: '',
  },
});

export const PublicLinkModal = () => {
  const [state, setState] = useRecoilState(PublicLinkModalAtom);
  const [isOnAdvancedScreen, setIsOnAdvancedScreen] = useState(false);

  return (
    <Modal
      open={state.open}
      onClose={() => {
        setState({ ...state, open: false });
      }}
      >
      {!!state.id &&
        <PublicLinkModalContent
          id={state.id}
          isOnAdvancedScreen={isOnAdvancedScreen}
          onShowAdvancedScreen={(active) => setIsOnAdvancedScreen(active)}
        />}
    </Modal>
  );
};

const PublicLinkModalContent = (props: {
  id: string,
  isOnAdvancedScreen: boolean,
  onShowAdvancedScreen: (active: boolean) => void,
}) => {
  const { id } = props;
  const { item, access, loading, update, refresh } = useDriveItem(id);
  const { item: parentItem } = useDriveItem(item?.parent_id || '');
  const { company, refresh: refreshCompany } = useCurrentCompany();
  useEffect(() => {
    refresh(id);
    refreshCompany();
  }, []);
  const havePublicLink = hasAnyPublicLinkAccess(item);

  return (
    <ModalContent
      title={
          <>
            {Languages.t(props.isOnAdvancedScreen
              ? 'components.item_context_menu.manage_access_advanced_to'
              : 'components.item_context_menu.manage_access_to') + ' '}
            <strong>{item?.name}</strong>
          </>
        }
      >
        <Subtitle>Im content ! {havePublicLink ? "Got a" : "No"} public link.</Subtitle>
      </ModalContent>
  );
}