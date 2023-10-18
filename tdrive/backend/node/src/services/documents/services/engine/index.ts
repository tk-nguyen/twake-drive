import globalResolver from "../../../global-resolver";
import { localEventBus } from "../../../../core/platform/framework/event-bus";
import { Initializable } from "../../../../core/platform/framework";
import { DocumentLocalEvent } from "../../types";
import { DocumentsProcessor } from "./extract-keywords";
import Repository from "../../../../core/platform/services/database/services/orm/repository/repository";
import { DriveFile, TYPE } from "../../entities/drive-file";
import { DocumentsFinishedProcess } from "./save-keywords";
import { ExecutionContext } from "../../../../core/platform/framework/api/crud-service";
import { DocumentEventsPayload } from "../../../../utils/types";
export class DocumentsEngine implements Initializable {
  private documentRepository: Repository<DriveFile>;

  async DispatchDocumentEvent(e: DocumentLocalEvent, context?: ExecutionContext) {
    const eventContext = context || {};
    const eventPayload = {
      document: {
        sender: e.resource.creator,
      },
      user: e.context.user,
    };
    console.log("🚀🚀 conserned drive file is the following: ", eventPayload, eventContext);
    localEventBus.publish<DocumentEventsPayload>("document:document_shared", eventPayload);
  }

  async init(): Promise<this> {
    const repository = await globalResolver.database.getRepository<DriveFile>(TYPE, DriveFile);

    globalResolver.platformServices.messageQueue.processor.addHandler(new DocumentsProcessor());
    globalResolver.platformServices.messageQueue.processor.addHandler(
      new DocumentsFinishedProcess(repository),
    );

    return this;
  }
}
