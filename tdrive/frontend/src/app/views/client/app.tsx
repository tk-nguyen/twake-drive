import { Suspense } from 'react';

import InitService from '@features/global/services/init-service';
import Client from '@views/client';

export default () => {
  const isAppReady = InitService.useWatcher(() => InitService.app_ready);

  if (!isAppReady) {
    return <div />;
  }

  return (
    <Suspense fallback={<></>}>
      <Client />
    </Suspense>
  );
};
