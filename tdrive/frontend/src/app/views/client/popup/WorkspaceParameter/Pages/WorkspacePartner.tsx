import React, { useState } from 'react';
import { Search } from 'react-feather';
import { Row, Col, Button, Input, Typography, Divider } from 'antd';
import Languages from '@features/global/services/languages-service';
import Collections from '@deprecated/CollectionsV1/Collections/Collections.js';
import WorkspaceService from '@deprecated/workspaces/workspaces.jsx';
import groupService from '@deprecated/workspaces/groups.js';
import workspacesUsers from '@features/workspace-members/services/workspace-members-service';
import Switch from 'components/inputs/switch';
import Pending from '@views/client/popup/WorkspaceParameter/Pages/WorkspacePartnerTabs/Pending';
import Members from '@views/client/popup/WorkspaceParameter/Pages/WorkspacePartnerTabs/Members';
import LockedInviteAlert from '@components/locked-features-components/locked-invite-alert';
import FeatureTogglesService, {
  FeatureNames,
} from '@features/global/services/feature-toggles-service';
import { useCurrentCompany } from '@features/companies/hooks/use-companies';

import './Pages.scss';
import { useSetRecoilState } from 'recoil';
import AccessRightsService from '@features/workspace-members/services/workspace-members-access-rights-service';
import useRouterWorkspace from '@features/router/hooks/use-router-workspace';

type PropsType = {
  col: {
    user: Record<string, string>;
    level: string;
  };
  adminLevelId: string;
  onChange: () => void;
};

export const AdminSwitch = (props: PropsType) => {
  workspacesUsers.useListener(useState as unknown as undefined);
  const loading = workspacesUsers.updateLevelUserLoading[props.col.user.id];
  const checked = props.col.level === props.adminLevelId;
  return (
    <div className="editLevel">
      <Switch
        loading={loading}
        label={Languages.t('scenes.app.popup.workspaceparameter.pages.moderator_status')}
        checked={checked}
        onChange={props.onChange}
      />
    </div>
  );
};

export default () => {
  const [searchValue, setSearchValue] = useState<string>('');
  Collections.get('workspaces').useListener(useState);
  WorkspaceService.useListener();
  workspacesUsers.useListener();
  Languages.useListener();
  const { company } = useCurrentCompany();
  const workspaceId = useRouterWorkspace();

  const usersInGroup = [];
  Object.keys(workspacesUsers.users_by_group[groupService.currentGroupId] || {}).map(
    // eslint-disable-next-line array-callback-return
    key => {
      const user = workspacesUsers.users_by_group[groupService.currentGroupId][key].user;
      if (
        !workspacesUsers.getUsersByWorkspace(WorkspaceService.currentWorkspaceId)[key] ||
        !workspacesUsers.getUsersByWorkspace(WorkspaceService.currentWorkspaceId)[key].user ||
        !workspacesUsers.getUsersByWorkspace(WorkspaceService.currentWorkspaceId)[key].user.id
      ) {
        usersInGroup.push({
          id: user.id,
          user: user,
          externe: workspacesUsers.users_by_group[groupService.currentGroupId][key].externe,
          groupLevel:
            workspacesUsers.users_by_group[WorkspaceService.currentGroupId][key].groupLevel,
        });
      }
    },
  );

  return (
    <div className="workspaceParameter">
      <Typography.Title level={1}>
        {Languages.t('scenes.app.popup.workspaceparameter.pages.collaborateurs')}
      </Typography.Title>

      {workspacesUsers.errorOnInvitation && (
        <div className="blocError">
          {Languages.t(
            'scenes.app.popup.workspaceparameter.pages.invitation_error',
            [],
            'An error occurred while inviting the following users: ',
          )}
          <br />
          <span className="text">
            {workspacesUsers.errorUsersInvitation.filter(item => item).join(', ')}
          </span>
          <div className="smalltext">
            {Languages.t(
              'scenes.app.popup.workspaceparameter.pages.invited_guest_check_message',
              [],
              'Check that the username or e-mail used is valid.',
            )}
          </div>
        </div>
      )}

      <Divider />

      {!FeatureTogglesService.isActiveFeatureName(FeatureNames.COMPANY_INVITE_MEMBER) ? (
        <LockedInviteAlert company={company} />
      ) : (
        <></>
      )}

      <Row className="small-y-margin" justify="space-between" align="middle">
        <Col>
          <Input
            placeholder={Languages.t('components.listmanager.filter')}
            prefix={<Search size={16} color="var(--grey-dark)" />}
            onChange={e => setSearchValue(e.target.value)}
          />
        </Col>
      </Row>

      <Pending filter={searchValue} />

      <Members filter={searchValue} />
    </div>
  );
};
