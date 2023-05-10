import config from "config";
import FastProxy from "@fastify/http-proxy";
import { Prefix, TdriveService } from "../../core/platform/framework";
import WebServerAPI from "../../core/platform/services/webserver/provider";
import Application from "../applications/entities/application";
import web from "./web/index";

@Prefix("/api")
export default class ApplicationsApiService extends TdriveService<undefined> {
  version = "1";
  name = "applicationsapi";

  public async doInit(): Promise<this> {
    const fastify = this.context.getProvider<WebServerAPI>("webserver").getServer();
    fastify.register((instance, _opts, next) => {
      web(instance, { prefix: this.prefix });
      next();
    });

    //Redirect requests from /plugins/* to the plugin server (if installed)
    const apps = config.get<Application[]>("applications.plugins") || [];
    for (const app of apps) {
      const domain = app.internal_domain.replace(/(\/$|^\/)/gm, "");
      const prefix = app.external_prefix.replace(/(\/$|^\/)/gm, "");
      if (domain && prefix) {
        console.log("Listening at ", "/" + prefix + "/*");
        fastify.register(FastProxy, {
          upstream: domain + "/" + prefix,
          prefix: "/" + prefix,
        });
      }
    }

    return this;
  }

  // TODO: remove
  api(): undefined {
    return undefined;
  }
}
