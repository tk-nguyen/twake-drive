import config from "config";
import FastProxy from "fast-proxy";
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
      const domain = app.internal_domain;
      const prefix = app.external_prefix;
      if (domain && prefix) {
        const { proxy, close } = FastProxy({
          base: domain,
        });
        console.log("Listening at ", "/" + prefix.replace(/(\/$|^\/)/gm, "") + "/*");
        fastify.addHook("onClose", close);
        fastify.all("/" + prefix.replace(/(\/$|^\/)/gm, "") + "/*", (req, rep) => {
          proxy(req.raw, rep.raw, req.url, {});
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
