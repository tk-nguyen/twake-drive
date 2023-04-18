import { UserType } from '@features/users/types/user';
import Api from '../../global/framework/api-service';
import { TdriveService } from '../../global/framework/registry-decorator-service';
import { AttachedFileType } from 'app/features/files/types/file';

const MESSAGES_PREFIX = '/internal/services/messages/v1/companies';

export type MessageFileDetails = AttachedFileType & {
  user: UserType;
  navigation: {
    previous: null | {
      message_id: string;
      id: string;
    };
    next: null | {
      message_id: string;
      id: string;
    };
  };
};

@TdriveService('ViewerAPIClientService')
class ViewerAPIClient {
  async getMessageFile(companyId: string, messageId: string, msgFileId: string) {
    const route = `${MESSAGES_PREFIX}/${companyId}/messages/${messageId}/files/${msgFileId}`;
    return await Api.get<{ resource: MessageFileDetails }>(route);
  }
}

export default new ViewerAPIClient();
