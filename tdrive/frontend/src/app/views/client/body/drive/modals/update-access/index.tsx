import { Modal, ModalContent } from '@atoms/modal';
import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { InternalAccessManager } from './internal-access';
import { useCurrentCompany } from '@features/companies/hooks/use-companies';
import Languages from 'features/global/services/languages-service';
import FeatureTogglesService, {
  FeatureNames,
} from '@features/global/services/feature-toggles-service';
import { changePublicLink, hasAnyPublicLinkAccess } from '@features/files/utils/access-info-helpers';

export type AccessModalType = {
  open: boolean;
  id: string;
};

export const AccessModalAtom = atom<AccessModalType>({
  key: 'AccessModalAtom',
  default: {
    open: false,
    id: '',
  },
});

export const AccessModal = () => {
  const [state, setState] = useRecoilState(AccessModalAtom);

  return (
    <Modal
      open={state.open}
      onClose={() => setState({ ...state, open: false })}
      >
      {!!state.id &&
        <AccessModalContent
          id={state.id}
          />}
    </Modal>
  );
};

const AccessModalContent = (props: {
  id: string,
}) => {
  const { id } = props;
  const { item, access, loading, update, refresh } = useDriveItem(id);
  const { item: parentItem } = useDriveItem(item?.parent_id || '');
  const { company, refresh: refreshCompany } = useCurrentCompany();
  useEffect(() => {
    refresh(id);
    refreshCompany();
  }, []);

  return (
    <ModalContent
      title={
          <>
            {Languages.t('components.internal-access_manage_title') + ' '}
            <strong>{item?.name}</strong>
          </>
        }
      >
      <div className={loading ? 'opacity-50' : ''}>
        {FeatureTogglesService.isActiveFeatureName(FeatureNames.COMPANY_SEARCH_USERS) && (
          <InternalAccessManager id={id} disabled={access !== 'manage'} />
        )}
      </div>
    </ModalContent>
  );
};
