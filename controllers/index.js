import { Controller } from "./lib/controller.js";

export class IndexController extends Controller {
  static get route() {
    return "^/$";
  }

  async getAll(url) {
    const logs =
      (await this.Model.getAll("startTime,type", {
        filter: ["BETWEEN", [new Date(0), "a"], [new Date(9999999999999), "z"]],
        order: this.Model.DESCENDING,
      })) || [];

    return this.view.getAll(logs);
  }
}
