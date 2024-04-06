import A from '@atoms/link';
import { Info } from '@atoms/text';
import { Modal, ModalContent } from '@atoms/modal';
import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { useState, useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { InternalAccessManager } from './internal-access';
import { PublicLinkManager } from './public-link-access';
import { useCurrentCompany } from '@features/companies/hooks/use-companies';
import Languages from 'features/global/services/languages-service';
import FeatureTogglesService, {
  FeatureNames,
} from '@features/global/services/feature-toggles-service';
import { ArrowLeftIcon, LockClosedIcon } from '@heroicons/react/outline';
import { PublicLinkAccessOptions } from './public-link-access-options';
import { CuteDepictionOfFolderHierarchy } from './cute-depiction-of-folder-hierarchy';
import { InheritAccessOptions } from './inherit-access-options';

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
  const [isOnAdvancedScreen, setIsOnAdvancedScreen] = useState(false);

  return (
    <Modal
      open={state.open}
      onClose={() => {
        if (isOnAdvancedScreen)
          setIsOnAdvancedScreen(false);
        else
          setState({ ...state, open: false });
      }}
      closeIcon={isOnAdvancedScreen && <ArrowLeftIcon className="w-5 dark:text-zinc-500" />}
      >
      {!!state.id &&
        <AccessModalContent
          id={state.id}
          isOnAdvancedScreen={isOnAdvancedScreen}
          onShowAdvancedScreen={(active) => setIsOnAdvancedScreen(active)}
        />}
    </Modal>
  );
};

const SwitchToAdvancedSettingsPanel = (props: {
  disabled: boolean,
  onShowAdvancedScreen: (active: boolean) => void,
}) =>
  <div className="p-4 flex flex-row items-center justify-center text-zinc-800 dark:text-white">
    <div className="shrink-0">
      <LockClosedIcon className="w-5 mr-2" />
    </div>
    <div className="grow">
      <div>Advanced security settings</div>
      <div><Info>Set password, expiration date, etc.</Info></div>
    </div>
    <div className="shrink-0">
      <A
        className={"inline-block" + (props.disabled ? ' !text-zinc-500' : '')}
        disabled={props.disabled}
        noColor={props.disabled}
        onClick={() => {
          if (!props.disabled)
            props.onShowAdvancedScreen(true);
        }}
      >
        Change
      </A>
    </div>
  </div>;

const AccessModalContent = (props: {
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
  const havePublicLink = (item?.access_info?.public?.level || 'none') !== 'none';
  const haveAdvancedSettings = parentItem?.parent_id !== null || havePublicLink;

  const updatePublicAccess = (key: string, value: string | number, skipLoading?: true) =>
    update({
      access_info: {
        entities: item?.access_info.entities || [],
        public: {
          ...item!.access_info!.public!,
          [key]: value || '',
        },
      },
    }, skipLoading);

  return (
    <ModalContent
      title={Languages.t(
        props.isOnAdvancedScreen
          ? 'components.item_context_menu.manage_access_advanced_to'
          : 'components.item_context_menu.manage_access_to') + ' ' + item?.name}
    >
      {!props.isOnAdvancedScreen ?
        <>
          <PublicLinkManager id={id} disabled={access !== 'manage'} />

          {FeatureTogglesService.isActiveFeatureName(FeatureNames.COMPANY_SEARCH_USERS) && (
            <InternalAccessManager id={id} disabled={access !== 'manage'} />
          )}

          {haveAdvancedSettings && <SwitchToAdvancedSettingsPanel
              disabled={!haveAdvancedSettings}
              onShowAdvancedScreen={props.onShowAdvancedScreen}
          />}
        </> : <>
          {havePublicLink &&
            <PublicLinkAccessOptions
              disabled={loading || access !== 'manage'}
              password={item?.access_info?.public?.password}
              expiration={item?.access_info?.public?.expiration}
              onChangePassword={(password: string) => {
                updatePublicAccess('password', password || '', true);
              }}
              onChangeExpiration={(expiration: number) => {
                updatePublicAccess('expiration', expiration || 0);
              }}
            />}
          { parentItem?.parent_id !== null && <>
              <InheritAccessOptions
                item={item}
                disabled={loading}
                onUpdate={update}
              />
              <CuteDepictionOfFolderHierarchy
                file={item}
                parent={parentItem}
              />
            </>}
        </>}
    </ModalContent>
  );
};
