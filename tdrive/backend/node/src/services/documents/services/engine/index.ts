import globalResolver from "../../../global-resolver";
import { logger } from "../../../../core/platform/framework";
import { localEventBus } from "../../../../core/platform/framework/event-bus";
import { Initializable } from "../../../../core/platform/framework";
import { DocumentLocalEvent } from "../../types";
import { DocumentsProcessor } from "./extract-keywords";
import Repository from "../../../../core/platform/services/database/services/orm/repository/repository";
import { DriveFile, TYPE } from "../../entities/drive-file";
import { DocumentsFinishedProcess } from "./save-keywords";
import { DocumentEventsPayload } from "../../../../utils/types";
export class DocumentsEngine implements Initializable {
  private documentRepository: Repository<DriveFile>;

  async DispatchDocumentEvent(e: DocumentLocalEvent) {
    const eventPayload = {
      document: {
        sender: e.resource.creator,
      },
      user: e.context.user,
    };
    const user = await globalResolver.services.users.get({ id: e.user_id });
    const company = await globalResolver.services.companies.getCompany({
      id: e.context.company.id,
    });
    try {
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
      localEventBus.publish<DocumentEventsPayload>("document:document_shared", eventPayload);
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

    return this;
  }
}
