import { Initializable } from "../../../../core/platform/framework";
// import gr from "../../../global-resolver";

/**
 * The notification engine is in charge of processing data and delivering user notifications on the right place
 */
export class NotificationEngine implements Initializable {
  async init(): Promise<this> {
    return this;
  }
}
