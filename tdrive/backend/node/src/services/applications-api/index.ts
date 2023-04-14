import { Prefix, TdriveService } from "../../core/platform/framework";
import WebServerAPI from "../../core/platform/services/webserver/provider";
import web from "./web/index";
import FastProxy from "fast-proxy";
import globalResolver from "../global-resolver";

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
    const apps = await globalResolver.services.applications.marketplaceApps.list(null);
    for (const app of apps) {
      const domain = app.internal_domain;
      const prefix = app.external_prefix;
      if (domain && prefix) {
        const { proxy, close } = FastProxy({
          base: domain,
        });
        fastify.addHook("onClose", close);
        fastify.all("/" + prefix.replace(/(\/$|^\/)/, "") + "/*", (req, rep) => {
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
