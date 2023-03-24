import React, { FC, Suspense } from 'react';

import { Layout } from 'antd';
import MainViewService from 'app/features/router/services/main-view-service';
import SideViewService from 'app/features/router/services/side-view-service';
import AppView from './AppView/AppView';

export const ViewContext = React.createContext({ type: '', id: '' });

const MainContent: FC<unknown> = () => {
  const [, mainId] = MainViewService.useWatcher(() => [
    MainViewService.getViewType(),
    MainViewService.getId(),
  ]);

  // Put the sideview in full screen if screen has not a big width
  const { innerWidth } = window;
  let sideViewWidth = '40%';
  if (innerWidth < 768) {
    sideViewWidth = '100%';
  }
  return (
    <ViewContext.Provider value={{ type: 'main', id: mainId }}>
      <Layout.Content className={'global-view-content'}>
        <Layout style={{ flex: '1' }}>
          <Layout style={{ height: '100%' }} hasSider>
            <Layout.Content>
              <Layout className="main-view-layout">
                <Layout.Content className="main-view-content">
                  <Suspense fallback={<></>}>
                    <AppView key={mainId} id={mainId} viewService={MainViewService} />
                  </Suspense>
                </Layout.Content>
              </Layout>
            </Layout.Content>
          </Layout>
        </Layout>
      </Layout.Content>
    </ViewContext.Provider>
  );
};

export default MainContent;
