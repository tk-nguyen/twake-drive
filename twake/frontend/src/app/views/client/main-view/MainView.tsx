// eslint-disable-next-line @typescript-eslint/no-use-before-define
import { Layout } from 'antd';
import { FC, useEffect, useState } from 'react';

import AccountStatusComponent from 'app/components/on-boarding/account-status-component';
import CompanyBillingBanner from 'app/components/on-boarding/company-billing-banner';
import useRouterChannel from 'app/features/router/hooks/use-router-channel';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import MainContent from './MainContent';
import Search from './MainHeader/Search';
import './MainView.scss';
import CompanyHeader from '../channels-bar/Parts/CurrentUser/CompanyHeader/CompanyHeader';
import CurrentUser from '../channels-bar/Parts/CurrentUser/CurrentUser';
import Footer from '../channels-bar/Parts/Footer';

type PropsType = {
  className?: string;
};

const MainView: FC<PropsType> = ({ className }) => {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const channelId = useRouterChannel();

  return (
    <Layout className={'global-view-layout ' + (className ? className : '')}>
      <AccountStatusComponent />
      {companyId && <CompanyBillingBanner companyId={companyId || ''} />}
      <div className="bg-white flex space-between w-full">
        <CurrentUser />
        <Search />
        <Footer />
      </div>
      <MainContentWrapper key={companyId + workspaceId + channelId} />
    </Layout>
  );
};

//This is used to delay render and make rest of UI faster
export const MainContentWrapper = () => {
  const [delayed, setDelayed] = useState(true);

  //This delay make the app superfast
  useEffect(() => {
    setTimeout(() => setDelayed(false), 50);
  }, []);

  if (delayed) {
    return <></>;
  }

  return <MainContent />;
};

export default ({ className }: PropsType) => {
  return <MainView className={className} />;
};
