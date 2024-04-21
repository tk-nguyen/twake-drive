import Select from '@atoms/input/input-select';
import { DriveFileAccessLevel } from '@features/drive/types';
import Languages from 'features/global/services/languages-service';

export const AccessLevelDropdown = ({
  disabled,
  level,
  onChange,
  canRemove,
  hiddenLevels,
  labelOverrides,
  className,
}: {
  disabled?: boolean;
  level: DriveFileAccessLevel | null;
  onChange: (level: DriveFileAccessLevel & 'remove') => void;
  canRemove?: boolean; //TODO: use hiddenLevels
  className?: string;
  labelOverrides?: { [key: string]: string };
  hiddenLevels?: string[];
}) => {
  const createOption = (level: DriveFileAccessLevel, tKey: string) =>
    !hiddenLevels?.includes(level) && <option value={level}>{(labelOverrides || {})[level] || Languages.t(tKey)}</option>;
  return (
    <Select
      disabled={disabled}
      className={
        className +
        ' w-auto'
      }
      theme={level === 'none' ? 'rose' : 'outline'}
      value={level || 'none'}
      onChange={e => onChange(e.target.value as DriveFileAccessLevel & 'remove')}
    >
      {createOption('manage', 'common.access-level_full_acess')}
      {createOption('write', 'common.access-level_write')}
      {createOption('read', 'common.access-level_read')}
      {createOption('none', 'common.access-level_no_access')}
      {canRemove && <option value={'remove'}>Remove</option>}
    </Select>
  );
};
