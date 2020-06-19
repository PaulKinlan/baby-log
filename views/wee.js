import { BaseView } from "./base.js";

export class WeeView extends BaseView {
  async getAll(data, extras) {
    data.type = "Wee";
    data.header = "Wees";

    return super.getAll(data, extras);
  }

  async get(data, extras) {
    data.header = "Poop";

    return super.get(data, extras);
  }

  async create(data, extras) {
    data.header = "Add a Wee";

    return super.create(data, extras);
  }

  async edit(data, extras) {
    data.header = "Update a Wee";

    return super.edit(data, extras);
  }
}
