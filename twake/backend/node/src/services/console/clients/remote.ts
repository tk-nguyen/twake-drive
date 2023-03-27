import { AxiosInstance } from "axios";
import { Issuer } from "openid-client";
import { ConsoleServiceClient } from "../client-interface";
import {
  ConsoleCompany,
  ConsoleHookCompany,
  ConsoleHookUser,
  ConsoleOptions,
  CreateConsoleCompany,
  CreateConsoleUser,
  CreatedConsoleCompany,
  CreatedConsoleUser,
  UpdateConsoleUserRole,
  UpdatedConsoleUserRole,
} from "../types";

import OktaJwtVerifier from "@okta/jwt-verifier";
import { CrudException } from "../../../core/platform/framework/api/crud-service";
import { logger } from "../../../core/platform/framework/logger";
import gr from "../../global-resolver";
import Company, { CompanySearchKey } from "../../user/entities/company";
import User from "../../user/entities/user";
import { ConsoleServiceImpl } from "../service";

export class ConsoleRemoteClient implements ConsoleServiceClient {
  version: "1";
  client: AxiosInstance;

  private infos: ConsoleOptions;
  private verifier: OktaJwtVerifier;

  constructor(consoleInstance: ConsoleServiceImpl, private dryRun: boolean) {
    this.infos = consoleInstance.consoleOptions;
    this.verifier = new OktaJwtVerifier({
      issuer: this.infos.issuer,
    });
  }
  fetchCompanyInfo(consoleCompanyCode: string): Promise<ConsoleHookCompany> {
    throw new Error("Method not implemented.");
  }
  resendVerificationEmail(email: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  private auth() {
    return {};
  }

  async addUserToCompany(
    company: ConsoleCompany,
    user: CreateConsoleUser,
  ): Promise<CreatedConsoleUser> {
    return null;
  }

  async updateUserRole(
    company: ConsoleCompany,
    user: UpdateConsoleUserRole,
  ): Promise<UpdatedConsoleUserRole> {
    logger.info("Remote: updateUserRole");
    return null;
  }

  async createCompany(company: CreateConsoleCompany): Promise<CreatedConsoleCompany> {
    logger.info("Remote: createCompany");
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addUserToTwake(user: CreateConsoleUser): Promise<User> {
    logger.info("Remote: addUserToTwake");
    //should do noting for real console
    return Promise.resolve(undefined);
  }

  async updateLocalCompanyFromConsole(partialCompanyDTO: ConsoleHookCompany): Promise<Company> {
    return null;
  }

  async updateLocalUserFromConsole(code: string): Promise<User> {
    return null;
  }

  async removeCompanyUser(consoleUserId: string, company: Company): Promise<void> {
    logger.info("Remote: removeCompanyUser");

    const user = await gr.services.users.getByConsoleId(consoleUserId);
    if (!user) {
      throw CrudException.notFound(`User ${consoleUserId} doesn't exists`);
    }
    await gr.services.companies.removeUserFromCompany({ id: company.id }, { id: user.id });
  }

  async removeUser(consoleUserId: string): Promise<void> {
    logger.info("Remote: removeUser");

    const user = await gr.services.users.getByConsoleId(consoleUserId);

    if (!user) {
      throw new Error("User does not exists on Twake.");
    }

    await gr.services.users.anonymizeAndDelete(
      { id: user.id },
      {
        user: { id: user.id, server_request: true },
      },
    );
  }

  async removeCompany(companySearchKey: CompanySearchKey): Promise<void> {
    logger.info("Remote: removeCompany");
    await gr.services.companies.removeCompany(companySearchKey);
  }

  async getUserByAccessToken(idToken: string): Promise<ConsoleHookUser> {
    const user = (await this.verifier.verifyIdToken(idToken, this.infos.audience)).claims as any;
    console.log("user", user);
    return {
      _id: user.sub,
      roles: [] as any,
      email: user.email,
      name: user.given_name,
      surname: user.family_name,
      isVerified: true,
      preference: {
        locale: user.locale,
        timeZone: 0,
        allowTrackingPersonalInfo: true,
      },
      avatar: {
        type: "url",
        value: user.picture,
      },
    };
  }
}
