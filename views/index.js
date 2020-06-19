import { BaseView } from "./base.js";

export class IndexView extends BaseView {
  async getAll(data, extras) {
    data.type = "All";
    data.header = "All";

    return super.getAll(data, extras)
  }
}
