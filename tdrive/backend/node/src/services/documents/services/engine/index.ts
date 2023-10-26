import globalResolver from "../../../global-resolver";
import { logger } from "../../../../core/platform/framework";
import { localEventBus } from "../../../../core/platform/framework/event-bus";
import { Initializable } from "../../../../core/platform/framework";
import { DocumentEvents, DocumentLocalEvent } from "../../types";
import { DocumentsProcessor } from "./extract-keywords";
import Repository from "../../../../core/platform/services/database/services/orm/repository/repository";
import { DriveFile, TYPE } from "../../entities/drive-file";
import { DocumentsFinishedProcess } from "./save-keywords";
export class DocumentsEngine implements Initializable {
  private documentRepository: Repository<DriveFile>;

  async DispatchDocumentEvent(e: DocumentLocalEvent) {
    const user = await globalResolver.services.users.get({ id: e.context.user.id });
    const company = await globalResolver.services.companies.getCompany({
      id: e.context.company.id,
    });
    try {
      localEventBus.publish("document:document_shared", {});
      const { html, text, subject } = await globalResolver.platformServices.emailPusher.build(
        "notification-document",
        user.language || "en",
        {
          user,
          company,
          notifications: [
            {
              title: "New document shared with you!",
            },
          ],
        },
      );
      await globalResolver.platformServices.emailPusher.send(user.email_canonical, {
        subject,
        html,
        text,
      });
    } catch (error) {
      logger.error(error);
    }
  }

  async init(): Promise<this> {
    const repository = await globalResolver.database.getRepository<DriveFile>(TYPE, DriveFile);

    globalResolver.platformServices.messageQueue.processor.addHandler(new DocumentsProcessor());
    globalResolver.platformServices.messageQueue.processor.addHandler(
      new DocumentsFinishedProcess(repository),
    );

    localEventBus.subscribe(DocumentEvents.DOCUMENT_SAHRED, async (e: DocumentLocalEvent) => {
      await this.DispatchDocumentEvent({
        ...e,
        event: DocumentEvents.DOCUMENT_SAHRED,
      });
    });

    return this;
  }
}
