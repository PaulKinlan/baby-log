import { BaseView } from "./base.js";

export class PoopView extends BaseView {
  async getAll(data, extras) {
    data.type = "Poop";
    data.header = "Poops";

    return super.getAll(data, extras);
  }

  async get(data, extras) {
    data.header = "Poop";

    return super.get(data, extras);
  }

  async create(data, extras) {
    data.header = "Add a Poop";

    return super.create(data, extras);
  }

  async edit(data, extras) {
    data.header = "Update a Poop";

    return super.edit(data, extras);
  }
}
