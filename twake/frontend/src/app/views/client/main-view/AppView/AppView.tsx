import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import AppViewService from 'app/features/router/services/app-view-service';
import Drive from 'app/views/applications/drive';
import { FC } from 'react';

type PropsType = {
  viewService: AppViewService;
  id: string;
};

const AppView: FC<PropsType> = props => {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();

  return (
    <Drive
      context={{
        companyId,
        workspaceId,
      }}
    />
  );
};
export default AppView;
