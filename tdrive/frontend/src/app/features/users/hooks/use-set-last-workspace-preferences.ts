import { useEffect } from 'react';
import UserAPIClient from '@features/users/api/user-api-client';
import useRouterCompany from '@features/router/hooks/use-router-company';
import useRouterWorkspace from '@features/router/hooks/use-router-workspace';

export const useSetLastWorkspacePreference = () => {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();

  useEffect(() => {
    UserAPIClient.setUserPreferences({
      recent_workspaces: [{ workspace_id: workspaceId, company_id: companyId }],
    });
  }, [workspaceId, companyId]);
};
