import { describe, beforeEach, it, expect, afterAll, jest } from "@jest/globals";
import { init, TestPlatform } from "../setup";
import TestHelpers from "../common/common_test_helpers";
import { localEventBus } from "../../../src/core/platform/framework/event-bus";
import { DocumentEvents } from "../../../src/services/documents/types";

jest.mock("../../../src/core/platform/framework/event-bus.ts");

describe("the Drive feature", () => {
  let platform: TestPlatform;
  const publish = jest.spyOn(localEventBus, "publish");

  beforeEach(async () => {
    platform = await init({
      services: [
        "webserver",
        "database",
        "applications",
        "search",
        "storage",
        "message-queue",
        "user",
        "search",
        "files",
        "websocket",
        "messages",
        "auth",
        "realtime",
        "channels",
        "counter",
        "statistics",
        "platform-services",
        "documents",
      ],
    });
  }, 300000000);

  afterAll(async () => {
    await platform?.tearDown();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    platform = null;
  });
  it("DOCUMENT_SHARED Notification has been triggered", async () => {
    // jest.setTimeout(20000);
    //given:: user uploaded one doc and give permission to another user
    const oneUser = await TestHelpers.getInstance(platform, true, { companyRole: "admin" });
    const anotherUser = await TestHelpers.getInstance(platform, true, { companyRole: "admin" });
    //upload files
    const doc = await oneUser.uploadRandomFileAndCreateDocument();
    await new Promise(r => setTimeout(r, 3000));
    //give permissions to the file
    doc.access_info.entities.push({
      type: "user",
      id: anotherUser.user.id,
      level: "read",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      grantor: null,
    });
    await oneUser.updateDocument(doc.id, doc);

    expect(publish).toHaveBeenCalledWith(DocumentEvents.DOCUMENT_SAHRED, {});
  });
});
