import config from "config";
import httpProxy from "http-proxy";
import { Prefix, TdriveService } from "../../core/platform/framework";
import WebServerAPI from "../../core/platform/services/webserver/provider";
import Application from "../applications/entities/application";
import web from "./web/index";

var proxy = httpProxy.createProxyServer({});

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
        try {
          fastify.all("/" + prefix + "/*", (req, rep) => {
            proxy.web(req.raw, rep.raw, {
              target: domain,
            });
          });
          console.log("Listening at ", "/" + prefix + "/*");
        } catch (e) {
          console.log(e);
          console.log("Can't listen to ", "/" + prefix + "/*");
        }
      }
    }

    return this;
  }

  // TODO: remove
  api(): undefined {
    return undefined;
  }
}
