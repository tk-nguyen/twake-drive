/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Initializable,
  TdriveContext,
  TdriveServiceProvider,
} from "../../../core/platform/framework";
import {
  CrudException,
  DeleteResult,
  ExecutionContext,
  ListResult,
  OperationType,
  Pagination,
  SaveResult,
} from "../../../core/platform/framework/api/crud-service";
import {
  getUserNotificationBadgeInstance,
  UserNotificationBadge,
  UserNotificationBadgePrimaryKey,
  UserNotificationBadgeType,
} from "../entities";
import { NotificationExecutionContext } from "../types";
import Repository from "../../../core/platform/services/database/services/orm/repository/repository";
import gr from "../../global-resolver";
import _, { pick } from "lodash";

export class UserNotificationBadgeService implements TdriveServiceProvider, Initializable {
  version: "1";
  repository: Repository<UserNotificationBadge>;

  async init(context: TdriveContext): Promise<this> {
    this.repository = await gr.database.getRepository<UserNotificationBadge>(
      UserNotificationBadgeType,
      UserNotificationBadge,
    );

    return this;
  }

  async get(
    pk: UserNotificationBadgePrimaryKey,
    context: ExecutionContext,
  ): Promise<UserNotificationBadge> {
    return await this.repository.findOne(pk, {}, context);
  }

  async save<SaveOptions>(
    badge: UserNotificationBadge,
    context: ExecutionContext,
  ): Promise<SaveResult<UserNotificationBadge>> {
    //Initiate the digest
    await gr.services.notifications.digest.putBadge(badge);

    await this.repository.save(getUserNotificationBadgeInstance(badge), context);
    return new SaveResult(UserNotificationBadgeType, badge, OperationType.CREATE);
  }

  async delete(
    pk: UserNotificationBadgePrimaryKey,
    context?: NotificationExecutionContext,
  ): Promise<DeleteResult<UserNotificationBadge>> {
    //Cancel the current digest as we just read the badges
    await gr.services.notifications.digest.cancelDigest(pk.company_id, pk.user_id);

    await this.repository.remove(pk as UserNotificationBadge, context);
    return new DeleteResult(UserNotificationBadgeType, pk as UserNotificationBadge, true);
  }

  list(): Promise<ListResult<UserNotificationBadge>> {
    throw new Error("Not implemented");
  }

  async listForUserPerCompanies(
    user_id: string,
    context: ExecutionContext,
  ): Promise<ListResult<UserNotificationBadge>> {
    //We remove all badge from current company as next block will create dupicates
    const companies_ids = (await gr.services.companies.getAllForUser(user_id)).map(
      gu => gu.group_id,
    );

    let result: UserNotificationBadge[] = [];
    let type = "";
    for (const company_id of companies_ids) {
      const find = await this.repository.find(
        {
          company_id,
          user_id,
        },
        {
          pagination: new Pagination("", "1"),
        },
        context,
      );
      type = find.type;
      result = result.concat(find.getEntities());
    }

    const badges = new ListResult(type, result);

    return badges;
  }

  async listForUser(
    company_id: string,
    user_id: string,
    filter: Pick<UserNotificationBadgePrimaryKey, "workspace_id">,
    context?: ExecutionContext,
  ): Promise<ListResult<UserNotificationBadge>> {
    if (!company_id || !user_id) {
      throw CrudException.badRequest("company_id and user_id are required");
    }

    //Cancel the current digest as we just read the badges
    await gr.services.notifications.digest.cancelDigest(company_id, user_id);

    const badges = await this.repository.find(
      {
        ...{
          company_id,
          user_id,
        },
        ...pick(filter, ["workspace_id", "channel_id", "thread_id"]),
      },
      {},
      context,
    );

    return badges;
  }

  /**
   * FIXME: This is a temporary implementation which is sending as many websocket notifications as there are badges to remove
   * A better implementation will be to do a bulk delete and have a single websocket notification event
   * @param filter
   * @param context
   */
  async removeUserChannelBadges(
    filter: Pick<UserNotificationBadgePrimaryKey, "workspace_id">,
    context?: ExecutionContext,
  ): Promise<number> {
    const badges = (
      await this.repository.find(
        _.pick(filter, ["workspace_id", "company_id", "channel_id", "user_id"]),
        {},
        context,
      )
    ).getEntities();

    return (
      await Promise.all(
        badges.map(async badge => {
          try {
            return (await this.delete(badge)).deleted;
          } catch (err) {}
        }),
      )
    ).filter(Boolean).length;
  }
}
