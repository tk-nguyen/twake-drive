import RouterService from '@features/router/services/router-service';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { RouterState } from '@features/router/state/atoms/router';
import { RouterTabSelector } from '@features/router/state/selectors/router-selector';

export default function useRouterTab() {
  const setClientState = useSetRecoilState(RouterState);
  RouterService.setRecoilState = setClientState;
  const channelId = useRecoilValue(RouterTabSelector);

  return channelId;
}
