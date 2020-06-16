import { BaseController } from "./base.js";

export class IndexController extends BaseController {
  static get route() {
    return "^/$";
  }

  static get type() {
    return "index";
  }

  async getAll(url) {
    const extras = {
      referrer: url,
    };

    const logs =
      (await this.Model.getAll("startTime,type", {
        filter: ["BETWEEN", [new Date(0), "a"], [new Date(9999999999999), "z"]],
        order: this.Model.DESCENDING,
      })) || [];

    return this.view.getAll(logs, extras);
  }
}
