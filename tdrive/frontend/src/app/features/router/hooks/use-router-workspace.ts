import { useRecoilValue, useSetRecoilState } from 'recoil';
import RouterService from '@features/router/services/router-service';
import { RouterState } from '@features/router/state/atoms/router';
import { RouterWorkspaceSelector } from '@features/router/state/selectors/router-selector';

export default function useRouterWorkspace() {
  const setClientState = useSetRecoilState(RouterState);
  RouterService.setRecoilState = setClientState;
  const workspaceId = useRecoilValue(RouterWorkspaceSelector);

  return workspaceId;
}
