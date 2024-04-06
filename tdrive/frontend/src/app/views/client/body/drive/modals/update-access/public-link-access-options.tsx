import { Info, Subtitle } from '@atoms/text';
import { ToasterService } from '@features/global/services/toaster-service';
import { copyToClipboard } from '@features/global/utils/CopyClipboard';
import { Checkbox } from 'app/atoms/input/input-checkbox';
import { Input } from 'app/atoms/input/input-text';
import { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import 'moment/min/locales';
import Languages from 'features/global/services/languages-service';
import { debounce } from 'lodash';

export const PublicLinkAccessOptions = (props: {
  disabled?: boolean;
  password?: string;
  expiration?: number;
  onChangePassword: Function;
  onChangeExpiration: Function;
}) => {
  const [usePassword, setUsePassword] = useState(!!props.password);
  const [password, setPassword] = useState(props.password);
  const [useExpiration, setUseExpiration] = useState((props.expiration || 0) > 0);
  const [expiration, setExpiration] = useState(props.expiration);
  const handlePasswordBlur = () => {
    props.onChangePassword(password);
  };

  const debouncedOnChangePassword = debounce(passwordValue => {
    props.onChangePassword(passwordValue);
  }, 500); // 500ms delay

  useEffect(() => {
    // Ensure the effect runs only if usePassword or password changes
    debouncedOnChangePassword(usePassword ? password : '');

    // Cleanup function to cancel the debounced call if the component is unmounted or the dependencies change
    return () => {
      debouncedOnChangePassword.cancel();
    };
  }, [usePassword, password]);

  useEffect(() => {
    props.onChangeExpiration(useExpiration ? expiration : 0);
  }, [useExpiration, expiration]);

  function expirationDate(exp: moment.MomentInput) {
    moment.locale(Languages.getLanguage());
    return moment(exp).fromNow(true).toLocaleString();
  }

  return (
    <>
      <Subtitle className="block mt-4 mb-1">
        {Languages.t('components.public-link-security')}
      </Subtitle>

      <div className="p-4 rounded-md border">
        <div className="flex items-center justify-center w-full h-10">
          <Checkbox
            disabled={props.disabled}
            labelNormalSize={true}
            onChange={s => {
              setUsePassword(s);
              if (!password && s) setPassword(Math.random().toString(36).slice(-8));
            }}
            value={!!usePassword}
            label={Languages.t('components.public-link-security_password')}
          />
          <div className="grow mr-2" />
          {!!usePassword && (
            <Input
              disabled={props.disabled}
              className="max-w-xs"
              value={password}
              onChange={e => setPassword(e.target.value)}
              // saves and copies password
              onClick={() => {
                if (password) copyToClipboard(password);
                ToasterService.success(
                  Languages.t('components.public-link-security_password_copied'),
                );
              }}
            />
          )}
        </div>
        <div className="flex items-center justify-center w-full h-10">
          <Checkbox
            disabled={props.disabled}
            labelNormalSize={true}
            onChange={s => {
              setUseExpiration(s);
              if (!expiration && s) setExpiration(Date.now() + 1000 * 60 * 60 * 24 * 7);
            }}
            value={!!useExpiration}
            label={Languages.t('components.public-link-security_expired')}
          />
          {useExpiration && (expiration || 0) < Date.now() && (
            <Info className="ml-2 text-red-500">
              ({Languages.t('components.public-link-security_expired')})
            </Info>
          )}
          {useExpiration && (expiration || 0) > Date.now() && (
            <Info className="ml-2">({expirationDate(expiration)})</Info>
          )}{' '}
          <div className="grow mr-2" />
          {!!useExpiration && (
            <Input
              disabled={props.disabled}
              type="date"
              className="max-w-xs"
              value={new Date(expiration || 0).toISOString().split('T')[0]}
              onChange={e => {
                e.target.value && setExpiration(new Date(e.target.value).getTime());
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};
