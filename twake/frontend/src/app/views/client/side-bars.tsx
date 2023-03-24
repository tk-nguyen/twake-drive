// eslint-disable-next-line @typescript-eslint/no-use-before-define
import { Layout } from 'antd';

import WorkspacesBar from './workspaces-bar';

import { useCurrentCompanyRealtime } from '../../features/companies/hooks/use-companies';

import { useNotifications } from 'app/features/users/hooks/use-notifications';
import { usePreloadSomeUsers } from 'app/features/users/hooks/use-user-list';
import './workspaces-bar/styles.scss';

export default () => {
  useCurrentCompanyRealtime();

  // We call this hook here to be able to preload some users in user list state
  usePreloadSomeUsers();
  useNotifications();

  return (
    <Layout style={{ height: '100%', backgroundColor: 'var(--secondary)' }}>
      <WorkspacesBar />
    </Layout>
  );
};
